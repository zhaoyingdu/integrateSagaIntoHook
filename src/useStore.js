import React,{useReducer} from "react";
import _ from 'lodash'


export const createStore = (reducer, init)=>{
  let subscribers = {}
  const subscribtionHandler = {
    apply: (target, thisArg, action)=>{
      const {type} = action[0]
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
  return {
    subscribtionHandler,
    addSubScribers,
    reducer, 
    init
  } 
}


const useStore = ({subscribtionHandler,addSubScribers,reducer, init})=>{
  const [state, dispatch] = useReducer(reducer, init)
  const subscribedDispatch = new Proxy(dispatch, subscribtionHandler)
  return [state, subscribedDispatch, addSubScribers]
}

export default useStore