"""Refresh the portfolio's public monthly history, retaining the last good file on failure."""
import argparse
import datetime as dt
import io
import json
import math
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET
import zipfile

SOURCE = "https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx"
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def parse_workbook(content):
    with zipfile.ZipFile(io.BytesIO(content)) as book:
        strings = ["".join(el.itertext()) for el in ET.fromstring(book.read("xl/sharedStrings.xml"))]
        workbook = ET.fromstring(book.read("xl/workbook.xml"))
        sheet = next(s for s in workbook.find("s:sheets", NS) if s.get("name") == "Monthly Prices")
        relation = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        rels = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
        target = next(r.get("Target") for r in rels if r.get("Id") == relation)
        path = target.lstrip("/") if target.startswith("/") else "xl/" + target
        rows = ET.fromstring(book.read(path)).findall("s:sheetData/s:row", NS)
        columns, units, records = {}, {}, []
        for row in rows:
            values = {}
            for cell in row:
                value = cell.find("s:v", NS)
                if value is None:
                    continue
                text = strings[int(value.text)] if cell.get("t") == "s" else value.text
                values[re.sub(r"\d", "", cell.get("r"))] = text
            for column, text in values.items():
                if text in ("Gold", "Silver"):
                    columns[text.lower()] = column
                if "troy oz" in text:
                    units[column] = text
            period = values.get("A", "")
            if not re.fullmatch(r"\d{4}M\d{2}", period):
                continue
            year, month = map(int, period.split("M"))
            date = dt.date(year, month, 1)
            prices = {metal: float(values[column]) for metal, column in columns.items()}
            if set(prices) != {"gold", "silver"} or any(not math.isfinite(v) or v <= 0 for v in prices.values()):
                raise ValueError("Invalid monthly metal prices")
            records.append({"date": date.isoformat(), **prices})
        if len(records) < 120 or any(column not in units for column in columns.values()):
            raise ValueError("Insufficient history or unexpected price units")
        if any(a["date"] >= b["date"] for a, b in zip(records, records[1:])):
            raise ValueError("History is not strictly chronological")
        return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "portfolio-data/metals-history.json")
    args = parser.parse_args()
    response = subprocess.run(["curl", "--fail", "--location", "--silent", "--show-error", "--max-time", "30", SOURCE], check=True, capture_output=True)
    records = parse_workbook(response.stdout)
    if args.output.exists():
        previous = json.loads(args.output.read_text())
        if records[-1]["date"] < previous["records"][-1]["date"]:
            raise ValueError("Source regressed; retaining newer history")
    data = {"source": "World Bank Pink Sheet", "sourceUrl": SOURCE,
            "frequency": "monthly", "unit": "USD per troy ounce",
            "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(), "records": records}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    temporary.chmod(0o644)
    temporary.replace(args.output)
    print(f"Published {len(records)} monthly observations through {records[-1]['date']}")


if __name__ == "__main__":
    main()
