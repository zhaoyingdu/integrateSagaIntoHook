import React, { useReducer, useEffect } from 'react';
import {patchReducerWithSaga} from './saga'
import './App.css';

const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {...state, counter:state.counter+1}
    case 'DECREMENT':
      return {...state, counter:state.counter-1}
    default:
      return state
  }
}

let increment = (dispatch)=>dispatch({type:'INCREMENT'})
let decrement = (dispatch)=>dispatch({type:'DECREMENT'})
let enableSaga = (dispatch)=>dispatch({type:'ENABLE_SAGA'})
let disableSaga = (dispatch)=>dispatch({type:'DISABLE_SAGA'})

const Counter = () =>{
  const store = useReducer(reducer, {counter:0})
  patchReducerWithSaga({key:'counter', store})
  return (
    <div className='App'>
      <div style={{fontSize: '5rem'}}>{store[0].counter}</div>
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
