import React, { useContext } from "react";
import {
  createStore,
  SagaReducerContext,
  SagaReducerContextProvider
} from "./useSagaReducerDetached";
import { put, takeEvery, select,take } from "redux-saga/effects";
import _ from "lodash";

import "./App.css";

const saga = function*() {
  yield put({type:'lol'})
    yield take('lol')
    console.log('hmmm')
  yield takeEvery("INCREMENTED", function*() {
    console.log(`[counter sum] take incremented`);
    const states = yield select(state => state);
    console.log("select is synchronized. state: " + JSON.stringify(states));
  });

  yield takeEvery("DECREMENTED", function*() {
    console.log(`[counter sum] take decremented`);
    const states = yield select(state => state);
    console.log("select is synchronized. state: " + JSON.stringify(states));
  });

  yield takeEvery("INCREMENT", function*() {
    console.log(`[counter] take increment`);
    yield put({ type: "INCREMENTED" });
  });
  yield takeEvery("DECREMENT", function*() {
    console.log(`[counter] take decrement`);
    yield put({ type: "DECREMENTED" });
  });
};

const initState = {
  counter: 0,
  totalIncrement: 0,
  totalDecrement: 0
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, counter: state.counter + 1 };
    case "DECREMENT":
      return { ...state, counter: state.counter - 1 };
    case "INCREMENTED":
      return { ...state, totalIncrement: state.totalIncrement + 1 };
    case "DECREMENTED":
      return { ...state, totalDecrement: state.totalDecrement + 1 };
    default:
      return state;
  }
};
const store = createStore(reducer, initState, saga);


let increment = dispatch => dispatch({ type: "INCREMENT" });
let decrement = dispatch => dispatch({ type: "DECREMENT" });

const Counter = () => {
  const [state, dispatch] = useContext(SagaReducerContext);
  return (
    <div className="App">
      <div style={{ fontSize: "5rem" }}>{state.counter}</div>
      <div>
        <a href="#" onClick={() => increment(dispatch)}>
          +
        </a>
        <span>{"   "}</span>
        <a href="#" onClick={() => decrement(dispatch)}>
          -
        </a>
      </div>
    </div>
  );
};

const CounterSum = () => {
  const [state, dispatch] = useContext(SagaReducerContext);
  return (
    <div className="App">
      <div style={{ fontSize: "2rem" }}>
        incremented: {state.totalIncrement} times
      </div>
      <div style={{ fontSize: "2rem" }}>
        decremented: {state.totalDecrement} times
      </div>
    </div>
  );
};


const Root = () => {
  return (
    <SagaReducerContextProvider store={store}>
      <Counter />
      <CounterSum />
    </SagaReducerContextProvider>
  )
}

export default Root;
