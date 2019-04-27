import React, {useEffect, useState} from "react";
import useStore,{createStore} from "./useStore";
import _ from "lodash";

import "./App.css";

const initState = {
  counter: 0
}

const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, counter: state.counter + 1 };
    case "DECREMENT":
      return { ...state, counter: state.counter - 1 };
    case 'RESET':
      return {counter: 0}
    default:
      return state;
  }
}


const store = (()=>createStore(reducer, initState))()
const Counter = () => {
  const [state, dispatch, addSubScribers] = useStore(store, null, 2)
  useEffect(()=>{
    _.forEach([
        {'INCREMENT': action=>console.log(`${action.type} dispatched; counter: ${state.counter}`)},
        {'DECREMENT': action=>console.log(`${action.type} dispatched; counter: ${state.counter}`)}
      ],
      subscriber=>addSubScribers(subscriber)
    )}, [])
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
  const [state, dispatch, addSubScribers] = useStore(store,null, 3);
  let [totalIncrement, setTotalIncrement] = useState(0)
  const [totalDecrement, setTotalDecrement] = useState(0)
  useEffect(()=>{
    _.forEach([
        {'INCREMENT': action=>{}/*setTotalIncrement(prev=>prev+1)*/},
        {'DECREMENT': action=>setTotalDecrement(prev=>prev+1)},
        {'RESET': action=>(setTotalDecrement(0) , setTotalIncrement(0))}
      ],
      subscriber=>addSubScribers(subscriber)
    )
  }, [])

  const reset = (seconds)=>{
    setTimeout(()=>{
      dispatch({type:'RESET'})
    }, seconds*1000)
  }
  return (
    <div className="App">
      <div style={{ fontSize: "2rem" }}>
        incremented: {totalIncrement} times
      </div>
      <div style={{ fontSize: "2rem" }}>
        decremented: {totalDecrement} times
      </div>
      <div>
        <div style={{ fontSize: "2rem" }}>asynchronous action can be dispatched ~!</div> 
        <a href='#' onClick={()=>dispatch({type:'RESET', argument: 5})}>reset in 5 secs</a>
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
