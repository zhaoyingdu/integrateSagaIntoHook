
import {stdChannel} from 'redux-saga'
import {useReducer, useEffect, useState} from 'react'
import _ from 'lodash'
import {runSaga } from 'redux-saga'
import { EventEmitter } from 'events';

/**
 * When called, returns a "channel" object that can be used as argument to run saga.
 * use case: created inside useSagaReducer, then called by runSaga to create a 
 *  collaborating saga for the reducer.
 * @param {Array} store the return value of a call to useReducer
 * @param {Object} sharedChannel an Object returned by sharedChannel(), used to collaborate saga-reducers
 * @param {String|Integer} id An unique Id assigned to an IO, used to remove corresponding reference inside
 *  sharedChannel
 */
const createIO = ({state, vanillaDispatch, sharedChannel, id})=>{
  const channel = stdChannel() 
  // redux-saga buffer, push by channel.put, pop by yield take(or channel.take, this methhod not used in this project)
  /**
   * with sharedChannel, this buffer has two source: 1. patched useReducer dspatch 2. sharedChannel.broadcast
   * without sharedChannel, this buffer has only source 1. stated above
   */
  let stateRef = state
  /** 
   * reference to the newest store[0]
   * this ref will be refreshed each time useSagaReducer is invoked,
   * according to Dan abramov's useEffect post about react mental model,
   * each re-render(i.e. componented function get called)
   * its enclosing functions will use variaables enclosed to that frame.
   * since the store argument is the value from onmount, it is neccessary to update
   * it upon each re-render, therefore the states will be updated to the newest value
   * from useReducer.
   * otherwise, call getState() (see below inside return) would always return the
   * state from first useReducer call, because we only stored this value inside
   * useeffect(()=>{...}, []) which is a one time execution after mount
   */
  const update = ({state})=>{
    stateRef = state
  }
  return  {
    id,
    update,
    channel,
    /**
     * not to confuse with useReducers' vanilla dispatch. this dispatch
     * function is used by redux saga to resolve a yield put(actionObj) call on the 
     * corresponding channel. (corresponding: IO, saga are corresponding to each other
     * if they are passed as argumen to one runSaga call, means that IO can only be
     * affected by that particular saga function(besides patched useReducer dispatch))
     */
    dispatch: action=>{
      channel.put(action)
      //console.log(action)
      //console.log(vanillaDispatch)
      vanillaDispatch(action)
    },
    getState(){
      return stateRef 
    },
    effectMiddlewares: [
      runEffect => effect =>{
        if(effect.type ==='PUT'){
          console.log(effect.payload.action)
          sharedChannel? sharedChannel.broadcast({action:effect.payload.action, sourceID: id}) : _.noop()
          runEffect(effect)
        } else{
          runEffect(effect)
        }
      }

    ],
  } 
}



export const sharedChannel = ()=>{
  const IOs = []
  const addIO = ({IO, id})=>{
    IOs.push({IO, id})
  }

  // everything is updated in IO, no need for the following code
  /*// refresh store on each re-render, purpose is to sync store[0] with new state resulted, 
  // from a re-render, same applies to createIO
  const refreshStore = ({store, id})=>{
    _.find(IOs, {id: id}).store = store
  }*/
  const broadcast = ({action, sourceID})=>{
    IOs.forEach(({IO, id})=>{
      sourceID === id ?_.noop() :IO.dispatch(action)
    })
  }
  const remove = (id)=>_.remove(IOs, io=>io.id === id)
  return {
    addIO,
    broadcast,
    remove,
  }
}


export const useSagaReducer = (reducer, initState,saga, sharedChannel=null)=>{
  const store = useReducer(reducer, initState)
  const [IO, setIO] = useState(null)

  const dispatch = action=>{
      const result = store[1](action) 
      IO.channel.put(action)
      return result
  }
  
  useEffect(()=>{
    const id = _.uniqueId()
    IO?_.noop(): console.log('IO not inited')
    const IO = createIO({state:store[0], vanillaDispatch: store[1], sharedChannel, id})
    setIO(IO)
    sharedChannel.addIO({IO, id})
    const mainTask = runSaga(IO, saga)
    return ()=>{
      sharedChannel? sharedChannel.remove(IO.id): _.noop() 
      /**
       * remove {IO, store} reference from sharedChannel's array,
       * nect mount will just store new reference again.
       */
      mainTask.cancel()
    }
  },[])
  useEffect(()=>{
    //IO ?IO.dispatch = dispatch :_.noop()
  }, [IO])
  
  useEffect(()=>{
    if(IO){
      IO.update({state: store[0]})  // refresh store[0] in IO
    }
  })
  return [store[0], dispatch]
}