import React, { useReducer, useEffect } from 'react';
import {patchReducerWithSaga, exampleSaga} from './sagaIO'
import './App.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return ++state
    case 'DECREMENT':
      return --state
    default:
      return state
  }
}

let increment = (dispatch)=>dispatch({type:'INCREMENT'})
let decrement = (dispatch)=>dispatch({type:'DECREMENT'})
let enableSaga = (dispatch)=>dispatch({type:'ENABLE_SAGA'})
let disableSaga = (dispatch)=>dispatch({type:'DISABLE_SAGA'})

const Counter = () =>{
  const store = useReducer(reducer, 0)
  const {run} = patchReducerWithSaga(store)
  run(exampleSaga);


  return (
    <div className='App'>
      <div style={{fontSize: '5rem'}}>{store[0]}</div>
      <div>
        <a href='#' onClick={()=>increment(store[1])}>+</a>
        <span>{'   '}</span>
        <a href='#' onClick={()=>decrement(store[1])}>-</a>
      </div>
      <div>
      <a href='#' onClick={()=>enableSaga(store[1])}>enable saga</a>
        <span>{'   '}</span>
        <a href='#' onClick={()=>disableSaga(store[1])}>disable saga</a>
      </div>
    </div>)
}

export default Counter
