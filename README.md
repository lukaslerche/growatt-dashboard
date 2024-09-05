# Growatt Dashboad

## Description
A small HTML dashboard to show stats from a Growatt inverter, instead of using the Growatt website or ShinePhone app. In the background, it uses the Growatt JS implementation (https://github.com/PLCHome/growatt).

## Features
- `/` show a small dashboard as HTML
- `/power` return the current power output as number
- `/raw` return the raw data from the inverter api as JSON

## Deploy via Docker
- Run the docker command
``` bash
docker run -d \
  --name scheduled-image-grab \
  -e GROWATT_USER=your_growatt_username \
  -e GROWATT_PASSWORD=your_growatt_password \
  -e PLANT_ID=the_plant_id \
  -e INVERTER_ID=the_inverter_id \
  -e KWH_PRICE=30.80 \
  -e MAX_POWER=800 \
  -p 3000:3000 \
  --log-driver=journald \
  --restart unless-stopped \
  ghcr.io/lukaslerche/growatt-dashboard
  ```
- or use the docker-compose file in this repository


## Development
- `pnpm install` to install dependencies
- `pnpm dev` to start the server
- open `http://localhost:3000` in your browser

## Tip: Make inverter report each minute
Taken from https://diysolarforum.com/threads/growatt-data-reporting-interval-change-question.51680/

Updating for anyone looking, this is another method:

1. Log in to your account at https://openapi-us.growatt.com/login
2. Click on Dashboard at the top-center.
3. Scroll down to "My photovoltaic Devices" and go all the way to the right and click "All Devices".
4. Under the tab for "Data Logger" you should see your device listed. Click "Data Logger Settings" all the way to the right.
5. Click "Advance Setting" at the bottom.
6. Type growatt + current date in the password slot at the bottom. (Format: YYYYMMDD). Example: growatt20240720
7. Select the first value "Register" by clicking the bullet next to it and enter a value of "4". (Note: There are 2 "Register" settings, one for setting and another for reading the settings already stored.)
8. Directly to the right next to "Value" enter 1.0 and press Enter.
9. It will display "Successful" in green text in the bottom left if it worked.

## Alternatives for Home Assistant users
There are a couple of alternatives to this project:
- If you run Home Assistant, then you can use the official integration: https://www.home-assistant.io/integrations/growatt_server/
- To fully replace or at least complement the Growatt cloud, consider using Grott (https://github.com/johanmeijer/grott) and its HA integration https://github.com/muppet3000/homeassistant-grott