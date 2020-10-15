## Git Analytics

Analyze editing history in git repos for visualization

### Features

## Dev Guide
### check local npm version
node -v: v14.12.0
npm -v: 6.14.8

### start server at local
in one termnial:
```
python server/run.py 
```
open another termnial:
```
cd client/app/ && npm start
```

### Q&A
#### npm fail to run
```
./src/App.scss (/Applications/anaconda3/lib/node_modules/react-scripts/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-5-1!/Applications/anaconda3/lib/node_modules/react-scripts/node_modules/postcss-loader/src??postcss!/Applications/anaconda3/lib/node_modules/react-scripts/node_modules/resolve-url-loader??ref--6-oneOf-5-3!/Applications/anaconda3/lib/node_modules/react-scripts/node_modules/sass-loader/dist/cjs.js??ref--6-oneOf-5-4!./src/App.scss)
To import Sass files, you first need to install node-sass.
Run `npm install node-sass` or `yarn add node-sass` inside your workspace.
```
if see above error try to run the following cmd:
```
npm install node-sass
```
if still fail, try to run this first:
```
npm audit fix
npm install node-sass
```
