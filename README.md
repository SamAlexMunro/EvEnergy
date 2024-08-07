## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Setup JSON-Server

1. Start JSON-Server

   ```
   json-server --watch db.json --port 3000
   ```

2. Configure network. Depending on what method of app deployment you're using to test with you'll need to update the `BASE_URL` within the `ev-energy.service.ts`

   - iOS Simulator `localhost:3000`
   - Android Simulator `10.0.2.2`
   - Android/iOS Device - Open the command prompt/terminal, run `ipconfig` and copy your `IPv4` address



