import sqlite3
import os

# Path to the database file
db_path = r"C:\Users\Morgan\AppData\Local\Microsoft\Windows\Notifications\wpndatabase.db"

# Ensure the file exists
if not os.path.exists(db_path):
    #print(f"Database file not found at: {db_path}")
    exit(1)


def get_notifications():
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Query to get the Payload and ArrivalTime from the Notification table
        cursor.execute("SELECT Payload, ArrivalTime FROM Notification ORDER BY ROWID DESC")
        results = cursor.fetchall()

        # Close the connection
        conn.close()

        # Return the list of lists: each element is [Payload, ArrivalTime]
        return results
    except sqlite3.Error as e:
        #print(f"Database error: {e}")
        return []
    except Exception as e:
        #print(f"Unexpected error: {e}")
        return []


def fetch_notifications_once():
    # Fetch the notifications once
    notifications = get_notifications()

    if notifications:
        # Filter notifications to only include Payloads that start with "<toast launch"
        filtered_notifications = [
            notification for notification in notifications
            if str(notification[0], 'utf-8').startswith("<toast launch")  # Decode to string if necessary
        ]

        # Check if any filtered notifications exist
        if filtered_notifications:
            # Sort the filtered notifications by ArrivalTime (most recent first)
            filtered_notifications.sort(key=lambda x: x[1], reverse=True)

            # The most recent notification
            most_recent_notification = filtered_notifications[0]
            payload = str(most_recent_notification[0], 'utf-8')  # Decode to string if necessary

            # Parse the Payload for the text after '@moonshot\r\n\r\n' and before the next space
            extracted_text = extract_text_after_moonshot(payload)

            # Return the extracted text or "None"
            return extracted_text if extracted_text else "None"
        else:
            return "None"
    else:
        return "None"


def extract_text_after_moonshot(payload):
    # Find the position of the '@moonshot\r\n\r\n'
    target = "@moonshot\r\n\r\n"
    start_pos = payload.find(target)

    if start_pos != -1:
        # Move the starting position after '@moonshot\r\n\r\n'
        start_pos += len(target)

        # Now extract the substring starting from this position and stop at the first "\r\n"
        # Find the position of the next "\r\n"
        end_pos = payload.find("\r\n", start_pos)

        # If no "\r\n" is found, extract the rest of the string
        if end_pos == -1:
            return payload[start_pos:]

        # Otherwise, extract the text between the start and "\r\n"
        return payload[start_pos:end_pos]

    return None


# Run the function to fetch and filter notifications once
if __name__ == "__main__":
    result = fetch_notifications_once()
    if result:
        print(result)
