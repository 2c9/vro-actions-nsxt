## About

The plugin for nsx-t doesn't seem to work with our versions of vro and nsx, so I had to write my own actions for segments creation and removing.

For the actions to work you need to add your NSX API endpoint to vRO inventory as a REST host. Also, transportZoneID is hardcoded in the script, so you should change it.

## Input variables for creation

![Create inputs](/assets/images/create_inputs.png "Create inputs")

## Input variables for removing

![Delete inputs](/assets/images/delete_inputs.png "Delete inputs")