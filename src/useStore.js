import React,{useReducer, useContext} from "react";
import _ from 'lodash'


export const createStore = (reducer, init)=>{
  let subscribers = {}
  const dispatchHandler = {
    apply: (target, thisArg, action)=>{
      const {type} = action[0]
      if(type instanceof Function || type instanceof Promise){
        const {argument} = action[0]
        return type(argument)
      }
      subscribers[type] && subscribers[type].length !== 0 
      ? setImmediate(()=>{
          _.forEach(subscribers[type], ({listener})=>listener(action[0]))
        }) 
      : _.noop()
      return _.bind(target, thisArg, action[0])()
    }
  }
  const addSubScribers = (newSubscriber)=>{
    const key = _.keys(newSubscriber)[0]
    const listener = newSubscriber[_.keys(newSubscriber)[0]]
    const id = _.uniqueId()
    subscribers[key] 
      ? subscribers[key].push({listener, id})
      : subscribers[key] = [{listener, id}]
    return ()=>{
      _.remove(subscribers[key], {id})
    }
  } 

  const _stateBuffer = {}

  return {
    dispatchHandler,
    addSubScribers,
    reducer, 
    init,
    _stateBuffer
  } 
}


const useStore = ({dispatchHandler,addSubScribers, reducer, init, _stateBuffer}, stateFilter, id)=>{
  const [state, dispatch] = useReducer(reducer, init)
  const subscribedDispatch = new Proxy(dispatch, dispatchHandler)
  console.log(id +' '+ JSON.stringify(_stateBuffer))
  _.merge(_stateBuffer, state)
  console.log(id+' '+ JSON.stringify(_stateBuffer))
  let filteredState = stateFilter? _.pick(_stateBuffer, stateFilter) : _stateBuffer
  
  return [filteredState, subscribedDispatch, addSubScribers]
}

export default useStore