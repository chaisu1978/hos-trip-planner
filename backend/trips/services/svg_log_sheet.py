import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter
from django.conf import settings

SVG_PATH = Path(__file__).resolve().parent.parent / "assets" / "driver-log-book-hostp.svg"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "assets"

def midpoint_between(status, y_map):
    order = ["off_duty", "sleeper_berth", "driving", "on_duty"]
    idx = order.index(status)
    if idx + 1 < len(order):
        return (y_map[status] + y_map[order[idx + 1]]) / 2
    # Special case: 'on_duty' is the last row, add slight offset for midpoint feel
    return y_map[status] + 10

def inject_duty_periods_into_svg(logs, trip_id, svg_input=SVG_PATH, output_dir=Path(settings.MEDIA_ROOT)):
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    ET.register_namespace('', ns['svg'])

    def get_x_position_for_time(root):
        """
        Returns a function that maps any HH:MM time string to an interpolated x-position.
        """
        raw_map = {}
        time_points = []

        for hour in range(24):
            hour_12 = hour % 12 or 12
            suffix = "am" if hour < 12 else "pm"
            for minute in [0, 15, 30, 45]:
                label = f"_{hour_12}{minute:02d}{suffix}_line"
                t_str = f"{hour:02d}:{minute:02d}"
                el = root.find(f".//svg:line[@id='{label}']", ns)
                if el is not None:
                    x = float(el.attrib.get("x1", "0"))
                    raw_map[t_str] = x
                    time_points.append((t_str, x))

        # Add 00:00 and 24:00 if present
        midnight_start = root.find(".//svg:line[@id='_1200am_line_start']", ns)
        if midnight_start is not None:
            raw_map["00:00"] = float(midnight_start.attrib.get("x1", "0"))
            time_points.append(("00:00", raw_map["00:00"]))

        midnight_end = root.find(".//svg:line[@id='_1200am_line_end']", ns)
        if midnight_end is not None:
            raw_map["24:00"] = float(midnight_end.attrib.get("x1", "0"))
            time_points.append(("24:00", raw_map["24:00"]))

        # Convert keys to minutes since midnight for easier math
        time_points.sort(key=lambda x: int(x[0][:2]) * 60 + int(x[0][3:]))

        def get_x(hhmm):
            h, m = map(int, hhmm.split(":"))
            target = h * 60 + m

            # Exact match
            if hhmm in raw_map:
                return raw_map[hhmm]

            # Find two closest time points
            for i in range(len(time_points) - 1):
                t1_str, x1 = time_points[i]
                t2_str, x2 = time_points[i + 1]
                t1_min = int(t1_str[:2]) * 60 + int(t1_str[3:])
                t2_min = int(t2_str[:2]) * 60 + int(t2_str[3:])

                if t1_min <= target <= t2_min:
                    ratio = (target - t1_min) / (t2_min - t1_min)
                    return x1 + (x2 - x1) * ratio

            return None  # fallback if totally outside range

        return get_x


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

        tree = ET.parse(svg_input)
        root = tree.getroot()
        get_x_for_time = get_x_position_for_time(root)
        y_map = get_y_positions(root)

        # Inject fixed-position text
        inject_text(root, 205.04, 73, log.get("month", ""))
        inject_text(root, 256, 73, log.get("day", ""))
        inject_text(root, 301.04, 73, log.get("year", ""))
        # inject_text(root, 122, 101, log.get("from_location", ""))
        # inject_text(root, 318, 101, log.get("to_location", ""))

        inject_text(root, 95, 137, f"{log.get('total_miles', 0)}")
        inject_text(root, 188, 137, f"{log.get('total_miles', 0)}")

        inject_text(root, 524, 270, log.get("off_duty_total", 0))
        inject_text(root, 524, 289, log.get("sleeper_berth_total", 0))
        inject_text(root, 524, 307, log.get("driving_total", 0))
        inject_text(root, 524, 325, log.get("on_duty_total", 0))
        inject_text(root, 524, 381, log.get("total_hours", 0))

        # Draw connected duty lines
        previous_x = None
        previous_y = None

        for i, duty in enumerate(log["duty_periods"]):
            start_time = duty["start"]
            end_time = duty["end"]
            status = duty["status"]

            x1 = get_x_for_time(start_time)
            x2 = get_x_for_time(end_time)
            current_y = midpoint_between(status, y_map)

            if x1 is None or x2 is None or current_y is None:
                print(f"⚠️ Missing position for {start_time}–{end_time} or status '{status}'")
                continue

            # (a) Draw vertical transition from previous status (if needed)
            if previous_x is not None and previous_y is not None and previous_x != x1:
                ET.SubElement(root, "line", {
                    "x1": str(round(x1, 2)),
                    "y1": str(round(previous_y, 2)),
                    "x2": str(round(x1, 2)),
                    "y2": str(round(current_y, 2)),
                    "stroke": "black",
                    "stroke-width": "2"
                })

            # (b) Draw horizontal line for current duty period
            ET.SubElement(root, "line", {
                "x1": str(round(x1, 2)),
                "y1": str(round(current_y, 2)),
                "x2": str(round(x2, 2)),
                "y2": str(round(current_y, 2)),
                "stroke": "black",
                "stroke-width": "2"
            })

            # (c) Draw vertical transition to next status (if different)
            next_duty = log["duty_periods"][i + 1] if i + 1 < len(log["duty_periods"]) else None
            if next_duty:
                next_status = next_duty["status"]
                next_y = midpoint_between(next_status, y_map)
                if next_status != status and next_y is not None:
                    ET.SubElement(root, "line", {
                        "x1": str(round(x2, 2)),
                        "y1": str(round(current_y, 2)),
                        "x2": str(round(x2, 2)),
                        "y2": str(round(next_y, 2)),
                        "stroke": "black",
                        "stroke-width": "2"
                    })

            previous_x = x2
            previous_y = current_y


        out_file = output_dir / str(trip_id) / "logs" / f"output-{date}.svg"
        out_file.parent.mkdir(parents=True, exist_ok=True)
        tree.write(out_file, encoding="utf-8", xml_declaration=True)
        print(f"✅ Saved SVG for {date} → {out_file}")
