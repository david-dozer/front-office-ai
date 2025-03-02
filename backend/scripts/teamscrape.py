import requests
import pandas as pd
from bs4 import BeautifulSoup

def scrape_team_cap_data():
    # URL for the 2025 NFL Team Salary Cap Tracker
    url = "https://www.spotrac.com/nfl/cap/_/year/2025/sort/cap_maximum_space2"

    # Headers to mimic a browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    # Get the webpage content
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Ensure the request was successful

    # Parse the HTML
    soup = BeautifulSoup(response.text, "html.parser")

    # Find the table containing the data
    table = soup.find("table", {"class": "datatable"})

    rows = soup.find_all("tr")

    # Initialize lists for each column
    ranks = []
    teams = []
    players_active = []
    avg_age_team = []
    total_cap_top_51 = []
    cap_space_top_51 = []
    total_cap_allocations = []
    cap_space_all = []

    # Process each row in the table
    for row in rows[1:]:
        cols = row.find_all("td")
        if len(cols) >= 11:  # Ensure row has enough columns
            ranks.append(cols[0].text.strip())
            teams.append(cols[1].text.strip().split()[0])  # Keeps only the first word (abbreviation)
            players_active.append(cols[2].text.strip())
            avg_age_team.append(cols[3].text.strip())
            total_cap_top_51.append(cols[4].text.strip())
            cap_space_top_51.append(cols[5].text.strip())
            total_cap_allocations.append(cols[6].text.strip())
            cap_space_all.append(cols[7].text.strip())

    # Create DataFrame
    df = pd.DataFrame({
        'Rank': ranks,
        'Team': teams,
        'Players Active': players_active,
        'Avg Age Team': avg_age_team,
        'Total Cap Top-51': total_cap_top_51,
        'Cap Space Top-51': cap_space_top_51,
        'Total Cap Allocations': total_cap_allocations,
        'Cap Space All': cap_space_all,
    })

    # Clean up the data
    # Convert numeric columns to appropriate data types
    numeric_columns = [
        'Total Cap Top-51', 'Cap Space Top-51',
        'Total Cap Allocations', 'Cap Space All'
    ]
    for col in numeric_columns:
        # Remove '$' and ',' then convert to numeric, replacing errors with NaN
        df[col] = pd.to_numeric(df[col].str.replace('[\$,]', '', regex=True), errors='coerce')

    # Save to CSV
    df.to_csv("team_cap_data.csv", index=False)

    return df

if __name__ == "__main__":
    # Scrape data and create DataFrame
    df = scrape_team_cap_data()
    
    print("\nFirst few rows:")
    print(df.head())
    
    print("\nDataFrame Info:")
    print(df.info())
    
    print("\nNon-null counts:")
    print(df.count())
    
    print("\nCap Space Top-51 Statistics (excluding missing values):")
    print(df['Cap Space Top-51'].describe())
