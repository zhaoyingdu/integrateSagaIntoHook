import React, { useReducer, useEffect } from 'react';
import {patchReducerWithSaga, exampleSaga} from './saga'
import './App.css';


const initState = {
  totalIncrement:0,
  totalDecrement:0
}
const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENTED':
      return {...state, totalIncrement:state.totalIncrement+1}
    case 'DECREMENTED':
    return {...state, totalDecrement:state.totalDecrement+1}
    default:
      return state
  }
}
const CounterSum = () =>{
  const store = useReducer(reducer, initState)
  patchReducerWithSaga({key:'counterSum', store})
  return (
    <div className='App'>
      <div style={{fontSize: '2rem'}}>incremented: {store[0].totalIncrement} times</div>
      <div style={{fontSize: '2rem'}}>decremented: {store[0].totalDecrement} times</div>
    </div>)
}

export default CounterSum
