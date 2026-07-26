import os
import pandas as pd
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)

publications = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "publications.csv"))

print("Publication Data")
print(publications)

# Line graph
plt.figure()
plt.plot(publications["Year"], publications["Papers"])
plt.title("Publications by Year")
plt.xlabel("Year")
plt.ylabel("Number of Papers")
plt.show()

# Bar graph
plt.figure()
plt.bar(publications["Domain"], publications["Papers"])
plt.title("Publications by Domain")
plt.xlabel("Research Domain")
plt.ylabel("Number of Papers")
plt.show()