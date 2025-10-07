import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("result_stats_history.csv")

df['Time'] = pd.to_datetime(df['Timestamp'], unit='s').dt.strftime('%M:%S')

df_unique = df.drop_duplicates(subset=['Timestamp'], keep='first')

x_labels = [f"{t}\n({u})" for t, u in zip(df_unique['Time'], df_unique['User Count'])]

plt.figure(figsize=(15,6))

plt.plot(x_labels, df_unique['Requests/s'], label='Success Requests/s', color='green')
plt.plot(x_labels, df_unique['Failures/s'], label='Failed Requests/s', color='red')

plt.xlabel("Time (mm:ss)\n(User Count)", fontsize=10)
plt.ylabel("Requests per Second", fontsize=10)
plt.title("Requests per Second over Time", fontsize=12)

plt.xticks(rotation=45, ha='right', fontsize=5)  
plt.yticks(fontsize=8)
plt.legend(fontsize=9)
plt.grid(False)
plt.tight_layout()
plt.show()
