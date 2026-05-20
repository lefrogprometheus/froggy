import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def verify_gsc():
    token_path = os.path.expanduser('~/.hermes/google_token.json')
    if not os.path.exists(token_path):
        print("Error: Google token not found. Please run authentication first.")
        return

    creds = Credentials.from_authorized_user_file(token_path)
    service = build('searchconsole', 'v1', credentials=creds)

    try:
        # List properties
        site_list = service.sites().list().execute()
        sites = site_list.get('siteEntry', [])

        if not sites:
            print("No GSC properties found for this account.")
        else:
            print("Successfully connected to GSC. Found properties:")
            for site in sites:
                print(f"- {site['siteUrl']} (Permission: {site['permissionLevel']})")
    except Exception as e:
        print(f"Error connecting to GSC API: {e}")

if __name__ == "__main__":
    verify_gsc()
