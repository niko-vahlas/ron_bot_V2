import { readFile } from 'fs/promises';
import { getContractAddress } from './notification_logic/getContractAddress.js';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { appendToCoinsSeen } from './write_coins_seen.js';
import { makeMoney } from './web3_logic/makeMoney.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
interface AddressesSeenJson {
  seenAddresses: string[];
}

dotenv.config();

async function main() {
  const filePath = path.resolve(__dirname, '../contract_addresses_seen.json');
  const fileContents = await readFile(filePath, 'utf8');
  const addressesSeenJson: AddressesSeenJson = JSON.parse(fileContents);
  const addressesSeen = new Set(addressesSeenJson.seenAddresses);

  while (true) {
    const currentContractAddress: string | null = await getContractAddress();

    if (!currentContractAddress) {
      console.log('No address');
    } else if (addressesSeen.has(currentContractAddress)) {
      console.log('No change detected.');
    } else {
      // Buying logic
      // Write to coins_seen
      await makeMoney(currentContractAddress);
      addressesSeen.add(currentContractAddress);
      await appendToCoinsSeen(addressesSeen);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
main();
