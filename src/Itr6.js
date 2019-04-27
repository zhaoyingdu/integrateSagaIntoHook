import React from "react";
import useStore, {createStore} from "./useStore";
import createSagaMiddleware from 'redux-saga'
import { put, takeEvery} from "redux-saga/effects";

import _ from "lodash";

import "./App.css";

const sagaMiddleware = createSagaMiddleware()
const saga = function*() {
  yield takeEvery("INCREMENT", function*() {
    yield put({ type: "INCREMENTED" });
  });
  yield takeEvery("DECREMENT", function*() {
    yield put({ type: "DECREMENTED" });
  });
};

const initState = {
  counter: 0,
  totalDecrement:0,
  totalIncrement:0
}
const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, counter: state.counter + 1};
    case "DECREMENT":
      return { ...state, counter: state.counter - 1};
    case "INCREMENTED":
      return { ...state, totalIncrement: state.totalIncrement + 1 };
    case "DECREMENTED":
      return { ...state, totalDecrement: state.totalDecrement + 1 };
    case 'RESET':
      return initState
    default:
      return state;
  }
}

const store = createStore(reducer, initState, sagaMiddleware)
sagaMiddleware.run(saga)
const Counter = () => {
  const [state, dispatch] = useStore(store)
  return (
    <div className="App">
      <div style={{ fontSize: "5rem" }}>{state.counter}</div>
      <div>
        <a href="#" onClick={()=>dispatch({ type: "INCREMENT" })}>+</a>
        <span>{"   "}</span>
        <a href="#" onClick={()=>dispatch({ type: "DECREMENT" })}>-</a>
      </div>
    </div>
  );
};

const CounterSum = () => {
  const [state, dispatch] = useStore(store)
  console.log(state)  
  const reset = (seconds)=>{
    setTimeout(()=>{
      dispatch({type:'RESET'})
    }, seconds*1000)
  }
  return (
    <div className="App">
      <div style={{ fontSize: "2rem" }}>
        incremented: {state.totalIncrement} times
      </div>
      <div style={{ fontSize: "2rem" }}>
        decremented: {state.totalDecrement} times
      </div>
      <div>
        <div style={{ fontSize: "2rem" }}>asynchronous action can be dispatched ~!</div> 
        <a href='#' onClick={()=>dispatch({type:reset, argument: 5})}>reset in 5 secs</a>
      </div>
    </div>
  );
};


const Root = () => {
  return (
    <div>
      <Counter />
      <CounterSum />
    </div>
  )
}

export default Root;
