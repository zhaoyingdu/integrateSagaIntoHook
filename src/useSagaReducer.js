
import {stdChannel} from 'redux-saga'
import {useReducer, useEffect, useState} from 'react'
import _ from 'lodash'
import {runSaga } from 'redux-saga'
import {EventEmitter} from 'events'
let id = 0
const createIO = (store, sharedChannel, id)=>{
  const channel = stdChannel()
  let storeRef = store
  const refreshStore = store=>storeRef = store
  return  {
    id,
    refreshStore,
    channel,
    dispatch: (actionObj)=>{
      sharedChannel? sharedChannel.emitter.emit('new put', actionObj): _.noop()
      storeRef[1](actionObj)
    },
    getState(){
      return storeRef[0]
    },
    effectMiddlewares: [],
  } 
}



export const sharedChannel = ()=>{
  const stores = []
  const emitter = new EventEmitter()
  const addIO = ({store, id})=>{
    stores.push({store, id})
  }
  // refresh store on each re-render, purpose is to syncing dispatch function, 
  // same applies to createIO
  const refreshStore = ({store, id})=>{
    _.find(stores, {id: id}).store = store
  }
  const broadcast = (actionObj)=>{
    stores.forEach(({store})=>{
      store[1](actionObj)
    })
  }
  const remove = (id)=>_.remove(stores, store=>store.id === id)
  emitter.on('new put', broadcast)

  return {
    emitter,
    addIO,
    refreshStore,
    broadcast,
    remove
  }
}



export const useSagaReducer = (reducer, initState,saga, sharedChannel=null)=>{
  const store = useReducer(reducer, initState)
  const [action, setAction] = useState(null)
  const [IO, setIO] = useState(null)
  const dispatch = action=>{
      const result = store[1](action) 
      setAction(action)
      return result
  }
  
  useEffect(()=>{
    id++
    const IO = createIO(store, sharedChannel, id)
    setIO(IO)
    sharedChannel.addIO({store, id})
    const mainTask = runSaga(IO, saga)
    return ()=>{
      sharedChannel? sharedChannel.remove(IO.id): _.noop()
      mainTask.cancel()
    }
  },[])
  useEffect(()=>{
    if(action !== null){
      IO.channel.put(action) // captured by yield take()
    }
  }, [action])
  useEffect(()=>{
    if(IO){
      IO.refreshStore(store)  // refresh store in IO
      sharedChannel.refreshStore({store, id: IO.id}) // refresh store in shared channel
    }
  })
  return [store[0], dispatch]
}