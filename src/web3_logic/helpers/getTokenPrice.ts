export async function getTokenPrice(id: string): Promise<number | undefined> {
  const url = `https://api.jup.ag/price/v2?ids=${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Error fetching data: ${response.statusText}`);
      return;
    }

    const data = await response.json();

    if (data.data[id] && data.data[id].price) {
      return parseFloat(data.data[id].price);
    } else {
      console.log(`Price data for ID ${id} not found.`);
      return;
    }
  } catch (error) {
    console.error('Failed to fetch price:', error);
    throw error;
  }
}
