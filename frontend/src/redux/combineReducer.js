import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from '@redux-devtools/extension';
import thunk from 'redux-thunk'
import WalletReducer from './connectWallet/reducer'

const middleware = [thunk]
const reducer = combineReducers({
  contract: WalletReducer,
});

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store;