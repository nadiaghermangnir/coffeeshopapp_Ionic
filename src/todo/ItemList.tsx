import React, {useContext, useEffect, useState} from 'react';
import {
    IonContent,
    IonList,
    IonFab,
    IonFabButton,
    IonButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLoading, IonSearchbar, IonSelect, IonSelectOption, IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Coffee from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import {Redirect, RouteComponentProps} from "react-router";
import {ItemProps} from "./ItemProps";
import {AuthContext} from "../auth";
import { useAppState } from './useAppState';
import { useNetwork } from './useNetwork';

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {

    const {appState} = useAppState();
    const {networkStatus} = useNetwork();

    const { items, fetching, fetchingError, updateServer } = useContext(ItemContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const [filter, setFilter] = useState<string | undefined>(undefined);

    const [search, setSearch] = useState<string>("");

    const selectOptions = ["Decaf", "Caffeinated"];

    const [itemsShow, setItemsShow] = useState<ItemProps[]>([]);

    const [position, setPosition] = useState(10);

    const {logout} = useContext(AuthContext);

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };

    useEffect(() => {
        if (networkStatus.connected) {
            updateServer && updateServer();
        }
    }, [networkStatus.connected]);


    useEffect(() => {
        if (items?.length) {
            setItemsShow(items.slice(0, 10));
        }
    }, [items]);
    log('render');


    async function searchNext($event: CustomEvent<void>) {
        if (items && position < items.length) {
            setItemsShow([...itemsShow, ...items.slice(position, position + 11)]);
            setPosition(position + 11);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (filter && items) {

            if (filter === "None")
                setItemsShow(items)
            else {
                const boolType = filter === "Decaf";

                let list: ItemProps[] = [];
                items.forEach((item: any) => {

                    let verify = false;
                    console.log(item.withCaffeine);
                    if (!item.withCaffeine) verify = true;

                    if (boolType === verify) {
                        list.push(item);
                    }
                });
                setItemsShow(list);
            }

        }
    }, [filter, items]);


    useEffect(() => {
        if (search && items) {
            setItemsShow(items.filter((item: any) => {
                if (search !== " ") {
                    return item.name.startsWith(search)
                } else {
                    return true;
                }
            }).slice(0, 10));
        }
    }, [search, items]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle color="secondary">Nadia's Coffee Shop</IonTitle>
                    <IonButton onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching items" />
                <IonSearchbar
                    value={search}
                    debounce={500}
                    onIonChange={(e) => {
                        if (e.detail.value!.length > 0) {
                            setSearch(e.detail.value!)
                        } else {
                            setSearch(" ")
                        }
                    }}
                />

                <IonSelect
                    value={filter}
                    placeholder="Select coffee that ...  "
                    onIonChange={(e) => setFilter(e.detail.value)}
                >
                    {selectOptions.map((option) => (
                        <IonSelectOption key={option} value={option}>
                            {option}
                        </IonSelectOption>
                    ))}
                </IonSelect>

                {/*<div>App state is {JSON.stringify(appState)}</div>*/}
                <div>Connected {JSON.stringify(networkStatus.connected)}</div>

                {itemsShow &&
                itemsShow.map((item: ItemProps) =>
                { return (
                        <Coffee
                            key={item._id}
                            _id={item._id}
                            name={item.name}
                            quantity={item.quantity}
                            available={item.available}
                            withCaffeine={item.withCaffeine}
                            userId={item.userId}
                            status={item.status}
                            version={item.version}
                            onEdit={(id) => history.push(`/item/${id}`)}
                            />
                    );

                })}
                <IonInfiniteScroll
                    threshold="100px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading..."/>
                </IonInfiniteScroll>
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/item')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
