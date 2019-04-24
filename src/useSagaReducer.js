
import {stdChannel} from 'redux-saga'
import {useReducer, useEffect, useState} from 'react'
import _ from 'lodash'
import {runSaga } from 'redux-saga'

const createIO = ({state, dispatch, sharedChannel, id})=>{
  const channel = stdChannel() 
  let stateRef = state
  /** 
   * reference to the newest store[0]
   * according to this post {@link https://overreacted.io/a-complete-guide-to-useeffect/} about react mental model,
   */
  const update = state=>{
    stateRef = state
  }
  return  {
    id,
    update,
    channel,
    dispatch,
    getState(){
      return stateRef 
    },
    effectMiddlewares: [
      runEffect => effect =>{
        if(effect.type ==='PUT'){
          sharedChannel? sharedChannel.broadcast({action:effect.payload.action, sourceID: id}) : _.noop()
          return runEffect(effect)
        }
        return runEffect(effect)   
      }

    ],
  } 
}

export const sharedChannel = ()=>{
  const IOs = []
  const addIO = IO=>IOs.push(IO)
  const broadcast = ({action, sourceID})=>{
    console.log(IOs)
    _.forEach(IOs, IO=> sourceID === IO.id ?_.noop() :IO.dispatch(action) )
  }
  const remove = id=>_.remove(IOs, IO=>IO.id === id)
  return {
    addIO,
    broadcast,
    remove,
  }
}

export const useSagaReducer = (reducer, initState,saga, sharedChannel=null)=>{
  const [state, dispatch] = useReducer(reducer, initState)
  const [IO, setIO] = useState( createIO({state, dispatch, sharedChannel, id:_.uniqueId()}) )
  
  const patchedDispatch = action=>{
    const result = dispatch(action) 
    IO.channel.put(action)
    return result
  }

  useEffect(()=>{
    sharedChannel.addIO(IO)
    const mainTask = runSaga(IO, saga)
    return ()=>{
      sharedChannel? sharedChannel.remove(IO.id): _.noop() 
      mainTask.cancel()
    }
  },[])
  
  useEffect(()=>{
    if(IO){
      IO.update(state)  // refresh store[0] in IO
    }
  })
  return [state, patchedDispatch]
}