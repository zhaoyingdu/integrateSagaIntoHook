import React from 'react';
import {useSagaReducer, sharedChannel} from './useSagaReducer'
import { put, takeEvery} from 'redux-saga/effects'
import './App.css';

const sharedSaga = sharedChannel()
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

const Counter = ({sharedChannel}) =>{
  const saga = function*(){
    yield takeEvery('INCREMENT', function*(){
      console.log(`[counter] take increment`)
      yield put({type:'INCREMENTED'})
    })
    yield takeEvery('DECREMENT', function*(){
      console.log(`[counter] take decrement`)
      yield put({type:'DECREMENTED'})
    })
  }
  const [state, dispatch] = useSagaReducer(reducer, {counter:0}, saga, sharedChannel )

  return (
    <div className='App'>
      <div style={{fontSize: '5rem'}}>{state.counter}</div>
      <div>
        <a href='#' onClick={()=>increment(dispatch)}>+</a>
        <span>{'   '}</span>
        <a href='#' onClick={()=>decrement(dispatch)}>-</a>
      </div>
    </div>)
}

const initState = {
  totalIncrement:0,
  totalDecrement:0
}
const sumReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENTED':
      return {...state, totalIncrement:state.totalIncrement+1}
    case 'DECREMENTED':
    return {...state, totalDecrement:state.totalDecrement+1}
    default:
      return state
  }
}
const CounterSum = ({sharedChannel}) =>{
  const saga = function*(){
    yield takeEvery('INCREMENTED', function*(){
      console.log(`[counter sum] take incremented`)
    })

    yield takeEvery('DECREMENTED', function*(){
      console.log(`[counter sum] take decremented`)
    })
  }
  const [state, dispatch] = useSagaReducer(sumReducer, initState, saga, sharedChannel )
  return (
    <div className='App'>
      <div style={{fontSize: '2rem'}}>incremented: {state.totalIncrement} times</div>
      <div style={{fontSize: '2rem'}}>decremented: {state.totalDecrement} times</div>
    </div>)
}

const Root = ()=>{
  return (
    <div>
      <Counter sharedChannel={sharedSaga}/>
      <CounterSum sharedChannel={sharedSaga} />
    </div>
  )
}



export default Root
