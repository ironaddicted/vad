# VAD Analytics setup

VAD's GA4 measurement ID `G-XMQGDWGHL2` is configured in `js/analytics.js`. Collection begins when these changes are published. The existing Google Ads tag and successful-submission conversion remain enabled.

1. The supplied VAD measurement ID is configured. Confirm the corresponding Web data stream belongs to the VAD website.
2. Publish the updated website. Use Tag Assistant / GA4 DebugView to verify page views and the events below. Check Realtime with a normal visit as well. Browser blockers can prevent collection.
3. Under Admin > Custom definitions, create event-scoped dimensions for `section_name`, `cta_location`, `project_category`, and `error_type`. Create a custom metric for `duration_seconds` with unit Seconds.
4. Mark `generate_lead` as a key event. Link the VAD property to Google Ads if campaign reporting is wanted. The site already records an Ads conversion for the same successful form request: avoid making an imported GA4 lead a second primary Ads conversion for that same action.

| Event | Meaning |
| --- | --- |
| `estimate_click` | Contact/estimate link clicked, with its placement |
| `project_category_click` | Project filter clicked, with `project_category`: `all`, `backsplash`, `flooring`, or `renovation`. Counts each click (including repeated selections), not the initial default filter. |
| `estimate_start` | First form edit per page load |
| `estimate_submit` | Valid submission attempt |
| `generate_lead` | Backend returned a successful HTTP response |
| `estimate_error` | Failed server response or network request |
| `section_view` | Section was dominant in the viewport for about one active second; once per section per page load |
| `section_engagement` | Approximate active seconds in the dominant visible section, emitted every 15 seconds and on transitions/exit |

GA4 automatically measures overall engagement time while the page is in focus. Use Engagement reports for site time, and an Exploration grouped by `section_name` with the custom duration metric for section time. Section times are sampled each second, exclude hidden/unfocused tabs and project modals, and are approximate; a rapid close or blocked request may lose a final sample. Seeing a section does not prove someone read it.

No names, email addresses, phone numbers, or project messages are added to custom analytics events. Automatic GA4 form events, if enabled in Enhanced Measurement, are separate from these custom events; use `generate_lead`, not automatic `form_submit`, to count confirmed requests.

Before release, verify desktop and mobile estimate links reach the form; invalid forms send no lead; server/network failures allow retry; successful responses record one lead and the existing Ads conversion. Use mocked form responses for development so tests do not send real inquiries. Production collection and GA4 account settings require verification after the ID is configured and the site is published.
