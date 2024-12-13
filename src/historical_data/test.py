import pandas as pd

data = pd.read_csv("LGTB.csv", parse_dates=["Timestamp"])

# Initialize variables
initial_investment = 100
units = 0
cash = initial_investment
last_action_price = None
actions = []

# Process rows
for index, row in data.iterrows():
    price = row["Price"]
    timestamp = row["Timestamp"]
    if index <= (75):
        continue

    if index == data.index[76]:  # First row, force a buy
        units = cash / price
        last_action_price = price
        cash = 0  # All cash is used in the first buy
        actions.append({"Timestamp": timestamp, "Action": "Buy", "Price": price, "Units": units, "Cash": cash})
    elif price <= last_action_price * 0.9:
        # Exit position entirely if price drops 10% below the last buy price
        cash += units * price  # Sell all units
        actions.append({"Timestamp": timestamp, "Action": "Sell", "Price": price, "Units": units, "Cash": cash})
        units = 0  # Reset units to 0 as everything is sold
        last_action_price = price  # Update the last action price

    elif price >= last_action_price * 1.05:
        sell_units = units / 2
        cash += sell_units * price
        units -= sell_units
        last_action_price = price
        actions.append({"Timestamp": timestamp, "Action": "Sell", "Price": price, "Units": sell_units, "Cash": cash})

# Convert actions to a DataFrame for analysis
actions_df = pd.DataFrame(actions)

# Calculate final balances
final_crypto_balance = units
final_cash_balance = cash
current_price = data.iloc[-1]["Price"]  # Use the last row's price
total_balance = final_cash_balance + (final_crypto_balance * current_price)
profit = total_balance - initial_investment

# Display results
print(actions_df)
print("\nSummary:")
print(f"Final Crypto Balance: {final_crypto_balance:.6f} units")
print(f"Final Cash Balance: ${final_cash_balance:.2f}")
print(f"Total Portfolio Value: ${total_balance:.2f}")
print(f"Profit: ${profit:.2f}")
