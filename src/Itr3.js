import React,{useRef, useImperativeHandle,forwardRef, useState} from 'react';
import {useSagaReducer, sharedChannel, selectAll} from './useSagaReducer'
import { put, takeEvery, call} from 'redux-saga/effects'
import _ from 'lodash'

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
  const allStatesref = useRef(null)
  const setStates = states=>allStatesref.current.setStates(states)
  const saga = function*(){
    yield takeEvery('INCREMENT', function*(){
      console.log(`[counter] take increment`)
      yield put({type:'INCREMENTED'})
      const states = yield call(selectAll, state=>state)
      setStates(states)
    })
    yield takeEvery('DECREMENT', function*(){
      console.log(`[counter] take decrement`)
      yield put({type:'DECREMENTED'})
      const states = yield call(selectAll, state=>state)
      setStates(states)
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
      <AllState ref={allStatesref} />
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

/**
 * a view to visualize the effect of function selectAll
 */
const AllState = forwardRef((props, ref)=>{
  const [states, setS] = useState(null)
  useImperativeHandle(ref, () => ({
      setStates: states=>setS(states)
    })
  )

  return (
    <div>
      <p>all states: (visible after call selectAll)</p>
      {_.toPairs(states).map(keyVal=>{
        return <div key={keyVal[0]+keyVal[1]}>{keyVal[0]}: {keyVal[1]}</div>
      })}
    </div>
  )
})

const Root = ()=>{
  return (
    <div>
      <Counter sharedChannel={sharedSaga}/>
      <CounterSum sharedChannel={sharedSaga} />
    </div>
  )
}



export default Root