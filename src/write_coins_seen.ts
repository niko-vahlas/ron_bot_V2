import fs from 'fs/promises';

export async function appendToCoinsSeen(contractAddress: string) {
  const filePath = './contract_addresses_seen.txt';
  try {
    // Check if the file exists, and if not, initialize it
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, ''); // Create the file if it doesn't exist
    }

    // Read the current contents of the file
    const currentContent = await fs.readFile(filePath, 'utf-8');

    // Determine the delimiter (append a comma if not empty)
    const delimiter = currentContent.trim() ? ',' : '';

    // Append the new contract address
    await fs.writeFile(
      filePath,
      `${currentContent}${delimiter}${contractAddress}`
    );
    console.log(`Appended contract address to ${filePath}`);
  } catch (error) {
    console.error('Error writing to file:', error);
  }
}
