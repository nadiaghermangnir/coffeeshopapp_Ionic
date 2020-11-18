import React, {useContext} from 'react';
import {
    IonContent,
    IonList,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLoading
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Coffee from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import {RouteComponentProps} from "react-router";

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
    const { items, fetching, fetchingError } = useContext(ItemContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle color="secondary">Nadia's Coffee Shop</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                {items && (
                    <IonList>
                        {items.map(({ id, name, quantity, available, withCaffeine}) =>
                            <Coffee id={id} name={name} quantity={quantity}
                                    available={available} withCaffeine={withCaffeine}
                                    onEdit={id => history.push(`/item/${id}`)} />)}
                    </IonList>
                )}
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
