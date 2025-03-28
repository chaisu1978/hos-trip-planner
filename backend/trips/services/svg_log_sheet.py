import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter

SVG_PATH = Path(__file__).resolve().parent.parent / "assets" / "driver-log-book-hostp.svg"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "assets"

def inject_duty_periods_into_svg(logs, svg_input=SVG_PATH, output_dir=OUTPUT_DIR):
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    ET.register_namespace('', ns['svg'])

    def get_hour_positions(root):
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
        end_line = root.find(".//svg:line[@id='timeline_end_line']", ns)
        if end_line is not None:
            hour_x[23] = float(end_line.attrib.get("x1", "0"))
        return hour_x

    def get_y_positions(root):
        y_map = {}
        for status in ["off_duty", "sleeper_berth", "driving", "on_duty"]:
            el = root.find(f".//svg:line[@id='{status}_topline']", ns)
            if el is not None:
                y_map[status] = float(el.attrib.get("y1", "0"))
        return y_map

    def inject_text(root, x, y, text):
        if text != "":
            ET.SubElement(root, "{http://www.w3.org/2000/svg}text", {
                "x": str(x),
                "y": str(y),
                "font-size": "10",
                "fill": "black"
            }).text = str(text)

    for log in logs:
        date = log["date"]
        print(f"\n🗓️ Injecting log for {date}...")

        # Tally up status durations
        status_durations = Counter()
        for duty in log["duty_periods"]:
            start_h, start_m = map(int, duty["start"].split(":"))
            end_h, end_m = map(int, duty["end"].split(":"))
            start_min = start_h * 60 + start_m
            end_min = end_h * 60 + end_m
            duration = max(0, end_min - start_min)
            status_durations[duty["status"]] += duration

        # Convert to hours rounded to 2 decimals
        def to_hours(minutes):
            return round(minutes / 60.0, 2)

        off_duty_total = to_hours(status_durations["off_duty"])
        sleeper_berth_total = to_hours(status_durations["sleeper_berth"])
        driving_total = to_hours(status_durations["driving"])
        on_duty_total = to_hours(status_durations["on_duty"])
        summed_total = round(off_duty_total + sleeper_berth_total + driving_total + on_duty_total, 2)

        tree = ET.parse(svg_input)
        root = tree.getroot()
        hour_x = get_hour_positions(root)
        y_map = get_y_positions(root)

        # Inject fixed-position text (manual coordinates)
        inject_text(root, 205.04, 73, log.get("month", ""))
        inject_text(root, 256, 73, log.get("day", ""))
        inject_text(root, 301.04, 73, log.get("year", ""))
        inject_text(root, 122, 101, log.get("from_location", ""))
        inject_text(root, 318, 101, log.get("to_location", ""))

        inject_text(root, 95, 137, f"{log.get('total_miles', 0)}")
        inject_text(root, 188, 137, f"{log.get('total_miles', 0)}")
        inject_text(root, 524, 270, off_duty_total)
        inject_text(root, 524, 289, sleeper_berth_total)
        inject_text(root, 524, 307, driving_total)
        inject_text(root, 524, 325, on_duty_total)
        inject_text(root, 524, 381, summed_total)

        for duty in log["duty_periods"]:
            start_hr, start_min = map(int, duty["start"].split(":"))
            end_hr, end_min = map(int, duty["end"].split(":"))

            # Interpolate x1
            if start_hr in hour_x and (start_hr + 1) in hour_x:
                x1 = hour_x[start_hr] + (hour_x[start_hr + 1] - hour_x[start_hr]) * (start_min / 60)
            else:
                x1 = hour_x.get(start_hr, 0)

            # Interpolate x2 with edge case handling for midnight or 23:59+
            if end_hr == 23:
                x2 = hour_x.get(23, hour_x.get(22, 0) + 20)
            elif end_hr in hour_x and (end_hr + 1) in hour_x:
                x2 = hour_x[end_hr] + (hour_x[end_hr + 1] - hour_x[end_hr]) * (end_min / 60)
            else:
                # If end_hr == 0 (midnight), try fallback to hour_x[0] directly
                x2 = hour_x.get(end_hr, x1)

            status_map = {
                "pickup": "on_duty",
                "dropoff": "on_duty",
                "fuel": "on_duty",
                "break": "off_duty",
                "rest": "sleeper_berth",
                "drive": "driving",
                "driving": "driving",
                "on_duty": "on_duty",
                "off_duty": "off_duty",
                "sleeper_berth": "sleeper_berth"
            }
            mapped_status = status_map.get(duty["status"])
            y = y_map.get(mapped_status)

            print(f"  ⏱️ {duty['status']} from {duty['start']} to {duty['end']} → x1: {x1}, x2: {x2}, y: {y}")
            if x1 is not None and x2 is not None and y is not None:
                ET.SubElement(root, "rect", {
                    "x": str(x1),
                    "y": str(y),
                    "width": str(x2 - x1),
                    "height": "10",
                    "fill": "red",
                    "opacity": "0.7"
                })

        out_file = output_dir / f"output-{date}.svg"
        tree.write(out_file, encoding="utf-8", xml_declaration=True)
        print(f"✅ Saved SVG for {date} → {out_file}")
