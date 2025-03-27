import xml.etree.ElementTree as ET
from pathlib import Path

SVG_PATH = Path(__file__).resolve().parent.parent / "assets" / "driver-log-book-hostp.svg"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "assets" / "output.svg"

def inject_duty_periods_into_svg(logs, svg_input=SVG_PATH, svg_output=OUTPUT_PATH):
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    ET.register_namespace('', ns['svg'])

    tree = ET.parse(svg_input)
    root = tree.getroot()

    # Get hour x-positions
    hour_x = {}
    for hour in range(24):
        label = f"{hour % 12 or 12}{'am' if hour < 12 else 'pm'}_line"
        elem = root.find(f".//svg:line[@id='_{label}']", ns)
        if elem is not None:
            hour_x[hour] = float(elem.attrib.get("x1", "0"))
        elif hour == 0:
            m = root.find(".//svg:line[@id='midnight_line']", ns)
            if m is not None:
                hour_x[0] = float(m.attrib.get("x1", "0"))
        elif hour == 12:
            n = root.find(".//svg:line[@id='noon_line']", ns)
            if n is not None:
                hour_x[12] = float(n.attrib.get("x1", "0"))

    print("DEBUG: Hour-to-x1 map:")
    for h, x in hour_x.items():
        print(f"  {h:02d}:00 → x = {x}")

    # Get y-positions for each duty status
    y_map = {}
    for status in ["off_duty", "sleeper_berth", "driving", "on_duty"]:
        el = root.find(f".//svg:line[@id='{status}_topline']", ns)
        if el is not None:
            y_map[status] = float(el.attrib.get("y1", "0"))

    print("DEBUG: Status-to-y1 map:")
    for s, y in y_map.items():
        print(f"  {s} → y = {y}")

    status_map = {
        "pickup": "on_duty",
        "dropoff": "on_duty",
        "fuel": "on_duty",
        "break": "off_duty",
        "rest": "sleeper_berth",
        "drive": "driving"
    }

    # Loop through logs and create visual bars
    for log in logs:
        print(f"\n🗓️ Log Date: {log['date']}")
        for duty in log["duty_periods"]:
            start_hr = int(duty["start"].split(":")[0])
            end_hr = int(duty["end"].split(":")[0])
            x1 = hour_x.get(start_hr)
            x2 = hour_x.get(end_hr)

            status = duty["status"]
            mapped_status = status_map.get(status)
            y = y_map.get(mapped_status)

            if y is None:
                print(f"  ⚠️ No Y position for status '{status}' (mapped as '{mapped_status}')")

            print(f"  ⏱️ {status} from {duty['start']} to {duty['end']} → x1: {x1}, x2: {x2}, y: {y}")

            if x1 is not None and x2 is not None and y is not None:
                ET.SubElement(root, "rect", {
                    "x": str(x1),
                    "y": str(y),
                    "width": str(x2 - x1),
                    "height": "10",
                    "fill": "red",
                    "opacity": "0.7"
                })

    tree.write(svg_output, encoding="utf-8", xml_declaration=True)
    print(f"\n✅ Output written to: {svg_output}")
