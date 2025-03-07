import requests
import pandas as pd
from bs4 import BeautifulSoup
import concurrent.futures
import time

off_url = "https://www.spotrac.com/nfl/free-agents/_/year/2025/position/off/sort/contract_value"
def_url = "https://www.spotrac.com/nfl/free-agents/_/year/2025/position/def/sort/contract_value"

def get_avg_salary(market_value_url):
    """
    Given a Spotrac market value URL, returns the average salary as a float,
    or None if not found or scraping fails.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    try:
        response = requests.get(market_value_url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception:
        return None  # Request error or timeout

    soup = BeautifulSoup(response.text, "html.parser")

    # Look for the <span> that exactly matches "Avg. Salary:"
    avg_salary_span = soup.find("span", text="Avg. Salary:")
    if avg_salary_span and avg_salary_span.next_sibling:
        # e.g. "$13,462,485"
        raw_salary_text = avg_salary_span.next_sibling.strip()
        clean_salary = raw_salary_text.replace("$", "").replace(",", "")
        try:
            return float(clean_salary)
        except ValueError:
            return None

    return None

def scrape_free_agents(url):
    """
    Scrape the main Spotrac free-agents page (for a given URL).
    Returns a DataFrame with columns: Name, Position, Age, YOE, Prev Team,
    AAV (from the main page), Type, and MV_Link (if there's a Market Value page).
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    response = requests.get(url, headers=headers).text
    soup = BeautifulSoup(response, "html.parser")

    rows = soup.find_all("tr")

    names, positions, ages, yoes = [], [], [], []
    prev_teams, original_aavs, types, mv_links = [], [], [], []

    for row in rows[1:]:
        cols = row.find_all("td")
        if len(cols) < 8:
            continue

        name = cols[0].text.strip()
        position = cols[1].text.strip()
        age_str = cols[2].text.strip()
        yoe_str = cols[3].text.strip()
        prev_team = cols[4].text.strip()
        aav_str = cols[5].text.strip()
        p_type = cols[6].text.strip()

        # Convert age and yoe to float
        try:
            age = float(age_str)
        except ValueError:
            age = None
        try:
            yoe = float(yoe_str)
        except ValueError:
            yoe = None

        # Clean AAV string from main table
        if aav_str:
            cleaned_aav_str = aav_str.replace("$", "").replace(",", "")
            try:
                original_aav = float(cleaned_aav_str)
            except ValueError:
                original_aav = None
        else:
            original_aav = None

        # Check for Market Value link in the last column
        link_tag = cols[7].find('a', href=True)
        if link_tag:
            base_url = "https://www.spotrac.com"
            mv_link = link_tag['href']
            # print(mv_link)
        else:
            mv_link = None

        names.append(name)
        positions.append(position)
        ages.append(age)
        yoes.append(yoe)
        prev_teams.append(prev_team)
        original_aavs.append(original_aav)
        types.append(p_type)
        mv_links.append(mv_link)

    df = pd.DataFrame({
        'Name': names,
        'Position': positions,
        'Age': ages,
        'YOE': yoes,
        'Prev Team': prev_teams,
        'AAV': original_aavs,  # Original AAV from main table
        'Type': types,
        'MV_Link': mv_links    # We'll fill in "Market Value" next
    })

    return df

def fetch_market_value_for_row(row, delay=0.2):
    """
    Worker function that takes a single DataFrame row,
    sleeps briefly (to avoid spamming the site),
    then scrapes the Market Value if a link is present.
    """
    link = row['MV_Link']
    if pd.isna(link) or not link:
        return None
    time.sleep(delay)  # Throttle requests a bit
    return get_avg_salary(link)

def scrape_market_values_concurrently(df, max_workers=5, delay=0.2):
    """
    Given a DataFrame with a column 'MV_Link', scrape each link in parallel
    to get the player's Market Value. Store the final result in a new
    'Market Value' column. If scraping fails or there's no link, fall back to 'AAV'.
    """
    # Create a thread pool
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {}
        for idx, row in df.iterrows():
            # Submit each row to the thread pool
            futures[executor.submit(fetch_market_value_for_row, row, delay)] = idx

        # Gather results
        results = {}
        for future in concurrent.futures.as_completed(futures):
            idx = futures[future]
            try:
                results[idx] = future.result()
            except Exception:
                results[idx] = None

    # Build the final "Market Value" column
    market_values = []
    for i in range(len(df)):
        mv = results.get(i)
        if mv is not None:
            market_values.append(mv)
        else:
            # Fallback to the original AAV if no Market Value
            market_values.append(None)

    df['market_value'] = market_values
    return df

def get_available_free_agents(url):
    """
    Scrape the main Spotrac free-agents page (for a given URL).
    Returns a DataFrame with columns: Name, Position, Age, YOE, Prev Team,
    AAV (from the main page), Type, and MV_Link (if there's a Market Value page).
    """

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    response = requests.get(url, headers=headers).text
    soup = BeautifulSoup(response, "html.parser")

    rows = soup.find_all("tr")

    names, positions, ages, yoes = [], [], [], []
    prev_teams, original_aavs, types, mv_links = [], [], [], []

    for row in rows[1:]:
        cols = row.find_all("td")
        if len(cols) < 8:
            continue

        # --- CLEAN UP the text in each cell to remove newlines & extra spaces ---
        # " ".join(string.split()) will remove \n and multiple spaces.
        name_str = " ".join(cols[0].text.split())
        position_str = " ".join(cols[1].text.split())
        age_str = " ".join(cols[2].text.split())
        yoe_str = " ".join(cols[3].text.split())
        prev_team_str = " ".join(cols[4].text.split())
        aav_str = " ".join(cols[5].text.split())
        p_type_str = " ".join(cols[6].text.split())

        # Convert age and yoe to float
        try:
            age = float(age_str)
        except ValueError:
            age = None
        try:
            yoe = float(yoe_str)
        except ValueError:
            yoe = None

        # Clean AAV string from main table
        if aav_str:
            cleaned_aav_str = aav_str.replace("$", "").replace(",", "")
            try:
                original_aav = float(cleaned_aav_str)
            except ValueError:
                original_aav = None
        else:
            original_aav = None

        # Check for Market Value link in the last column
        link_tag = cols[7].find('a', href=True)
        if link_tag:
            base_url = "https://www.spotrac.com"
            mv_link = link_tag['href']
            # print(mv_link)
        else:
            mv_link = None

        # Append to lists
        names.append(name_str)
        positions.append(position_str)
        ages.append(age)
        yoes.append(yoe)
        prev_teams.append(prev_team_str)
        original_aavs.append(original_aav)
        types.append(p_type_str)
        mv_links.append(mv_link)

    df = pd.DataFrame({
        'Name': names,
        'Position': positions,
        'Age': ages,
        'YOE': yoes,
        'Prev Team': prev_teams,
        'AAV': original_aavs,  # Original AAV from main table
        'Type': types,
        'MV_Link': mv_links    # We'll fill in "Market Value" next
    })

    # Remove rows where Age and AAV is null
    df = df.dropna(subset=['Age', 'AAV'])
    df = df.reset_index(drop=True)

    return df

# ------------------------------------------------------------
# Example usage if this file is run directly:
# ------------------------------------------------------------
if __name__ == "__main__":

    # 1) Scrape the main table
    df_off = get_available_free_agents(off_url)
    # df_off = scrape_free_agents(off_url)

    # 2) Scrape Market Value in parallel
    df_off = scrape_market_values_concurrently(df_off, max_workers=5, delay=0.2)

    # Now 'df_off' has:
    #  - AAV (original from the main page)
    #  - Market Value (scraped from the MV link, or fallback to AAV if not found)
    df_off.to_csv('backend/processed_data/free_agents.csv', index=False)
    print(df_off.head(20))
