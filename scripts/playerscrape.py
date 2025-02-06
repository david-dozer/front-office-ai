import requests
import pandas as pd
from bs4 import BeautifulSoup

def scrape_free_agents():
    # URL for free agents
    url = "https://www.spotrac.com/nfl/free-agents/_/year/2025/"

    # Headers to mimic browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    # Get the webpage content
    response = requests.get(url, headers=headers).text

    # Parse the HTML
    soup = BeautifulSoup(response, "html.parser")

    # Find all rows in the table
    rows = soup.find_all("tr")

    # Initialize lists for each column
    names = []
    positions = []
    ages = []
    yoes = []
    prev_teams = []
    aavs = []
    types = []

    # Skip header row and process each row
    for row in rows[1:]:
        cols = row.find_all("td")
        if len(cols) >= 7:  # Ensure row has enough columns
            names.append(cols[0].text.strip())
            positions.append(cols[1].text.strip())
            ages.append(cols[2].text.strip())
            yoes.append(cols[3].text.strip())
            prev_teams.append(cols[4].text.strip())
            aavs.append(cols[5].text.strip())
            types.append(cols[6].text.strip())

    # Create DataFrame
    df = pd.DataFrame({
        'Name': names,
        'Position': positions,
        'Age': ages,
        'YOE': yoes,
        'Prev Team': prev_teams,
        'AAV': aavs,
        'Type': types
    })

    # Clean up the data
    # Convert Age and YOE to numeric, replacing errors with NaN
    df['Age'] = pd.to_numeric(df['Age'], errors='coerce')
    df['YOE'] = pd.to_numeric(df['YOE'], errors='coerce')
    
    # Clean up AAV (remove $ and convert to numeric)
    # First replace empty strings with NaN
    df['AAV'] = df['AAV'].replace('', pd.NA)
    # Then clean and convert non-empty values
    df['AAV'] = df['AAV'].str.replace('$', '').str.replace(',', '').astype(float, errors='ignore')

    # Save to CSV
    df.to_csv("free_agents.csv", index=False)

    return df

if __name__ == "__main__":
    # Scrape data and create DataFrame
    df = scrape_free_agents()
    
    print("\nFirst few rows:")
    print(df.head())
    
    print("\nDataFrame Info:")
    print(df.info())
    
    print("\nNon-null counts:")
    print(df.count())
    
    print("\nPosition Breakdown:")
    print(df['Position'].value_counts())
    
    # Calculate statistics excluding NaN values
    print("\nAAV Statistics (excluding missing values):")
    print(df['AAV'].describe())