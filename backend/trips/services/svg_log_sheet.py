import xml.etree.ElementTree as ET
from pathlib import Path
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


def compute_totals_from_periods(duty_periods):
    """
    Given a list of duty_periods with 'start', 'end', and 'status',
    compute the total hours spent in each status.
    Returns a dict, e.g. {
      "off_duty": 8.0,
      "sleeper_berth": 0.0,
      "driving": 4.5,
      "on_duty": 1.5
    }
    """
    totals = {
        "off_duty": 0.0,
        "sleeper_berth": 0.0,
        "driving": 0.0,
        "on_duty": 0.0
    }

    def hhmm_to_minutes(t):
        h, m = map(int, t.split(":"))
        return h * 60 + m

    for period in duty_periods:
        start = hhmm_to_minutes(period["start"])
        end   = hhmm_to_minutes(period["end"])
        duration_minutes = end - start
        duration_hours   = duration_minutes / 60.0

        status = period["status"]
        if status in totals:
            totals[status] += duration_hours
        else:
            # Just in case there's some other status unexpectedly
            pass

    return totals


def inject_duty_periods_into_svg(logs, trip_id, svg_input=SVG_PATH, output_dir=Path(settings.MEDIA_ROOT)):
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    ET.register_namespace('', ns['svg'])

    ##########################################################################
    # 1. HELPER FUNCTIONS for rounding times to nearest 15 min and adding off-duty
    ##########################################################################

    def hhmm_to_minutes(hhmm: str) -> int:
        """Convert 'HH:MM' to integer minutes from midnight."""
        h, m = map(int, hhmm.split(":"))
        return h * 60 + m

    def minutes_to_hhmm(m: int) -> str:
        """Convert integer minutes from midnight back to 'HH:MM' (24h format)."""
        hh = m // 60
        mm = m % 60
        # If you prefer '24:00' for midnight's end, handle that case if hh == 24.
        return f"{hh:02d}:{mm:02d}"

    def round_to_quarter_hour(m: int) -> int:
        """
        Round integer minutes from midnight to nearest 15-min increment.
        This example: <8 min => round down, ≥8 => round up.
        """
        quarter = 15
        remainder = m % quarter
        if remainder < 8:
            return m - remainder
        else:
            return m + (quarter - remainder)

    def add_pre_post_off_duty_periods(duty_periods):
        """
        Ensure each day is fully covered from 00:00 to 24:00 by adding off_duty
        if needed before the first duty period and after the last duty period.
        """
        # Sort by start time
        duty_periods.sort(key=lambda d: hhmm_to_minutes(d["start"]))
        if not duty_periods:
            # If no periods, define the entire day as off-duty
            return [{"start": "00:00", "end": "24:00", "status": "off_duty"}]

        # 1) Add off-duty before the first period, if needed
        first_start = hhmm_to_minutes(duty_periods[0]["start"])
        if first_start > 0:
            duty_periods.insert(0, {
                "start": "00:00",
                "end": minutes_to_hhmm(first_start),
                "status": "off_duty",
            })

        # 2) Add off-duty after the last period, if needed
        last_end = hhmm_to_minutes(duty_periods[-1]["end"])
        if last_end < 24 * 60:  # 24:00 = 1440 minutes
            duty_periods.append({
                "start": minutes_to_hhmm(last_end),
                "end": "24:00",
                "status": "off_duty",
            })

        # Optional: merge adjacent off_duty if you prefer a cleaner final list
        # e.g., if the first period was off_duty and the second period is also off_duty
        merged = []
        for period in duty_periods:
            if not merged:
                merged.append(period)
            else:
                prev = merged[-1]
                if prev["status"] == period["status"] == "off_duty":
                    # Extend the previous period's end
                    prev["end"] = period["end"]
                else:
                    merged.append(period)
        return merged

    def round_duty_periods_to_quarter_hours(duty_periods):
        """
        For each period, round start/end to the nearest 15-min block
        before injecting them into the SVG.
        """
        for d in duty_periods:
            start_m = hhmm_to_minutes(d["start"])
            end_m = hhmm_to_minutes(d["end"])
            d["start"] = minutes_to_hhmm(round_to_quarter_hour(start_m))
            d["end"]   = minutes_to_hhmm(round_to_quarter_hour(end_m))
        return duty_periods

    def round_hours_to_quarter(decimal_value):
        """Round a float hour total to nearest 0.25 increment."""
        try:
            val = float(decimal_value)
        except:
            val = 0.0
        return round(val * 4) / 4.0

    ##########################################################################
    # 2. EXISTING HELPER FUNCTIONS (unchanged)
    ##########################################################################

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

    ##########################################################################
    # 3. MAIN LOOP (modified only to add rounding steps)
    ##########################################################################

    for log in logs:
        date = log["date"]

        tree = ET.parse(svg_input)
        root = tree.getroot()
        get_x_for_time = get_x_position_for_time(root)
        y_map = get_y_positions(root)

        ######################################################################
        # (a) Round each duty period and insert pre/post off-duty
        ######################################################################
        duty_periods = log.get("duty_periods", [])

        # 1) Round the user-provided periods
        duty_periods = round_duty_periods_to_quarter_hours(duty_periods)

        # 2) Insert pre/post off-duty
        duty_periods = add_pre_post_off_duty_periods(duty_periods)

        # 3) (Optional) Round again in case you want the newly inserted segments also snapped
        duty_periods = round_duty_periods_to_quarter_hours(duty_periods)

        # now final
        log["duty_periods"] = duty_periods

        # Now compute new totals from the final, updated periods
        new_totals = compute_totals_from_periods(duty_periods)

        # Round each total to .25 increments if you like:
        log["off_duty_total"]      = round_hours_to_quarter(new_totals["off_duty"])
        log["sleeper_berth_total"] = round_hours_to_quarter(new_totals["sleeper_berth"])
        log["driving_total"]       = round_hours_to_quarter(new_totals["driving"])
        log["on_duty_total"]       = round_hours_to_quarter(new_totals["on_duty"])

        # Then, if you want a 'total_hours' as the sum, do:
        sum_all = (new_totals["off_duty"]
                   + new_totals["sleeper_berth"]
                   + new_totals["driving"]
                   + new_totals["on_duty"])
        log["total_hours"] = round_hours_to_quarter(sum_all)
        log["duty_periods"] = duty_periods

        ######################################################################
        # (b) Round the daily hour totals to the nearest 0.25 increment
        ######################################################################
        # If your code sets these as numbers, they might be floats or strings:
        log["off_duty_total"]       = round_hours_to_quarter(log.get("off_duty_total", 0))
        log["sleeper_berth_total"]  = round_hours_to_quarter(log.get("sleeper_berth_total", 0))
        log["driving_total"]        = round_hours_to_quarter(log.get("driving_total", 0))
        log["on_duty_total"]        = round_hours_to_quarter(log.get("on_duty_total", 0))
        log["total_hours"]          = round_hours_to_quarter(log.get("total_hours", 0))

        ######################################################################
        # (c) Inject fixed-position text (unchanged)
        ######################################################################
        inject_text(root, 205.04, 73, log.get("month", ""))
        inject_text(root, 256, 73, log.get("day", ""))
        inject_text(root, 301.04, 73, log.get("year", ""))

        inject_text(root, 95, 137,  f"{log.get('total_miles', 0)}")
        inject_text(root, 188, 137, f"{log.get('total_miles', 0)}")

        inject_text(root, 524, 270, log.get("off_duty_total", 0))
        inject_text(root, 524, 289, log.get("sleeper_berth_total", 0))
        inject_text(root, 524, 307, log.get("driving_total", 0))
        inject_text(root, 524, 325, log.get("on_duty_total", 0))
        inject_text(root, 524, 381, log.get("total_hours", 0))

        ######################################################################
        # (d) Draw connected duty lines (unchanged except for referencing
        #     the updated log["duty_periods"])
        ######################################################################
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
                #  Debug for off positioning
                if settings.DEBUG:
                    print(f"Missing position for {start_time}–{end_time} or status '{status}'")
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

        ######################################################################
        # (e) Save out the SVG (unchanged)
        ######################################################################
        out_file = output_dir / str(trip_id) / "logs" / f"output-{date}.svg"
        out_file.parent.mkdir(parents=True, exist_ok=True)
        tree.write(out_file, encoding="utf-8", xml_declaration=True)
