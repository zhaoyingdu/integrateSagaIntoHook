import React,{useState, useEffect} from "react";
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

// example use of initialize store + with middleware - start
const store = createStore(reducer, initState, sagaMiddleware)
sagaMiddleware.run(saga)
// example use of initialize store + with middleware - end

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
  const [state, dispatch, addSubsriber] = useStore(store)
  const [countDown, setCountdown] = useState(5)

  //example use of action subscribers-start
  let timer
  const counting = ()=>{
    timer = setInterval(()=>{
      setCountdown(prev=>prev-1)
    }, 1000)  
  }
  useEffect(()=>{
    const remove1 = addSubsriber({
      'about to reset':counting
    })
    const remove2 = addSubsriber({
      'RESET':
      ()=>{
        if(timer){
          clearInterval(timer)
          setCountdown(5)
        }
      }
    })
    return ()=>{
      remove1()
      remove2()
    }
  }, [])
  //example use of action subscribers-end

  //example use of constructing asynchronous action-start
  const reset = (seconds)=>{
    dispatch({type:'about to reset'})
    setTimeout(()=>{
      dispatch({type:'RESET'})
    }, seconds*1000)
  }
  //example use of constructing asynchronous action-end

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
        
        {/*example use of dispatching asynchronous action*/}
        <a href='#' onClick={()=>dispatch({type:reset, argument: 5})}>reset in {countDown} secs</a>
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
