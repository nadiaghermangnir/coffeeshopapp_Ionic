import React, {useEffect, useReducer, useCallback} from 'react';
import { getLogger } from '../core';
import { ItemProps } from "./ItemProps";
import {createItem, getItems, newWebSocket, updateItem, removeItem} from "./ItemsAPI";
import PropTypes from "prop-types";
const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;
type DeleteItemFn = (item: ItemProps) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
    deleting: boolean,
    deletingError?: Error |  null,
    deleteItem?: DeleteItemFn,
}


interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it.id === item.id);
                if (index === -1) {
                    items.splice(0, 0, item);
                } else {
                    items[index] = item;
                }
                return { ...state,  items, saving: false };
            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
            case DELETE_ITEM_STARTED:
                return { ...state, deleteError: null, delete: true};
            case DELETE_ITEM_SUCCEEDED:
                const itemsd = [...(state.items || [])];
                const itemd = payload.item;
                const indexd = itemsd.findIndex(it => it.id === itemd.id);
                delete itemsd[indexd];
                const itemsfiltered = itemsd.filter(function (i ) {
                    return i !== undefined;

                });

                return  {...state, itemsfiltered, deleting: false };

            case DELETE_ITEM_FAILED:
                return { ...state, deletingError: payload.error, deleting: false };
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}


export const ItemProvider: React.FC<ItemProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {items, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getItemsEffect, []);
    useEffect(wsEffect, []);
   // useEffect()
    const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
    const deleteItem = useCallback<DeleteItemFn>(deleteItemCallback, []);
    const value = {items, fetching, fetchingError, saving, savingError, saveItem, deleting, deletingError, deleteItem};
    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        };

        async function fetchItems() {
            try {
                log('fetchItems started');
                dispatch({type: FETCH_ITEMS_STARTED});
                const items = await getItems();
                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items}});
                }
            } catch (error) {
                log('fetchItems failed');
                dispatch({type: FETCH_ITEMS_FAILED, payload: {error}});
            }
        }
    }

    async function saveItemCallback(item: ItemProps) {
        try {
            log('saveItem started');
            dispatch({type: SAVE_ITEM_STARTED});
            const savedItem = await (item.id ? updateItem(item) : createItem(item));
            log('saveItem succeeded');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});
        } catch (error) {
            log('saveItem failed');
            dispatch({type: SAVE_ITEM_FAILED, payload: {error}});
        }
    }

    async function deleteItemCallback(item: ItemProps) {
        try {
            log('deleteItem started');
            dispatch({type: DELETE_ITEM_STARTED});
            const deletedItem = await removeItem(item);
            log('deleteItem succeeded');
            dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {item: deletedItem}});
        } catch (error) {
            log('deleteItem failed');
            dispatch({type: DELETE_ITEM_FAILED, payload: {error}});
        }
    }


    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { item }} = message;
            log(`ws message, item ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
            }
            if (event === 'deleted') {
                dispatch({type: DELETE_ITEM_SUCCEEDED, payload: { item } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }


};
