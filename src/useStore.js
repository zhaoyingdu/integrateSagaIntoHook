import React, {useReducer, useEffect,useState,useRef, useContext} from "react";
import _ from 'lodash'
import {createStore as ReduxStore} from 'redux'
import { EventEmitter } from "events";



export const createStore = (...args)=>{
  const listeners = []
  const dispatchEventEmitter  = new EventEmitter()
  const addSubScriber = (newSubscriber)=>{
    const key = _.keys(newSubscriber)[0]
    const listener = newSubscriber[_.keys(newSubscriber)[0]]
    const id = _.uniqueId()
    listeners[key] 
      ? listeners[key].push({listener, id})
      : listeners[key] = [{listener, id}]
    return ()=>{
      _.remove(listeners[key], {id})
    }
  } 
  const {getState, dispatch} = ReduxStore(...args)

  const dispatchHandler = {
    apply: (target, thisArg, args)=>{
      const {type, argument} = args[0]
      if(type instanceof Function || type instanceof Promise){
        type(argument)
        return args[0]
      }
      target(...args)
      //dispatchEventEmitter.emit('DISPATCH', getState())
      if(!_.isEmpty(listeners && !(type instanceof Function || type instanceof Promise))){
        _.forEach(listeners, ({listener})=>{
          listener()
        })
      }
      
      return args[0]
    }
  }
  const proxiedDispatch = new Proxy(dispatch, dispatchHandler)
  const ContextValue = {
    state:getState(),
    dispatch: function(action){
      proxiedDispatch(action)
      this.state = getState()
    }
  }

  function ContextVal(initState){
    this.state = {current: initState}
    this.dispatch = (function(action){
      proxiedDispatch(action)
      this.state.current = getState()
    }).bind(this)
  }

  const Context = React.createContext(new ContextVal(getState()))

  dispatchEventEmitter.on('DISPATCH', newState=>{
    console.log('value'+Context.Provider.value)
    Context.Provider.value=newState
  })

  return {Context, addSubScriber}
}


const context = React.createContext({
  state:{value:{counter:0}}
})

const useStore = ({Context, addSubScriber})=>{
  /*let {state, dispatch} = useContext(Context)
  const [triggerableState, setTriggerableState] = useState(state.current)

  const dispatchTrigger = action=>{
    //apply:(target, thisArgs, args)=>{
      dispatch(action)
      setTriggerableState(state.current)
      console.log('current '+JSON.stringify(triggerableState))
  }
  useEffect(()=>{
  },[])*/

  return useContext(Context)

}


export default useStore//new Proxy(useStore, useStoreHandler)