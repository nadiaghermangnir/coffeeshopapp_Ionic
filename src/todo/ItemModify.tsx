import React, { useContext, useEffect, useState } from 'react';
import Moment from 'moment'
import {
  IonButton,
  IonButtons,
  IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonLabel,
  IonToolbar,
    IonItem,
    IonCheckbox,
    IonDatetime,
    IonRadioGroup
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import {trash} from "ionicons/icons";
import {AuthContext} from "../auth/AuthProvider";
import {useNetwork} from "./useNetwork";


const log = getLogger('ItemModify');

interface ItemModifyProps extends RouteComponentProps<{
  id?: string;
}> {}

export const ItemModify: React.FC<ItemModifyProps> = ({ history, match }) => {
  const {items, saving, savingError, saveItem, deleteItem, getServerItem, oldItem} = useContext(ItemContext);
  const {networkStatus} = useNetwork();
  const [itemV2, setItemV2] = useState<ItemProps>();
  const [status, setStatus] = useState(1);
  const [version, setVersion] = useState(-100);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [withCaffeine, setWithCaffeine] = useState(false);
  const [available, setAvailable] = useState(new Date());
 // const [caffeine, setCaffeine] = useState(false);
  const [item, setItem] = useState<ItemProps>();
  const {_id} = useContext(AuthContext);
  const [userId, setUserId] = useState(_id);

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find((it) => it._id === routeId);
    setItem(item);
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setAvailable(item.available);
      setWithCaffeine(item.withCaffeine)
      setStatus(item.status);
      setVersion(item.version);
      getServerItem && getServerItem(match.params.id!, item?.version);

      //setCaffeine(item.withCaffeine);

    }

  }, [match.params.id, items]);

  useEffect(() => {
    setItemV2(oldItem);
    log("setOldItem: " + JSON.stringify(oldItem));
  }, [oldItem]);

  const handleSave = () => {
    const editedItem = item ? { ...item, name, quantity, available, withCaffeine, userId,status: 0,
          version: item.version ? item.version + 1 : 1 }
    : { name, quantity, available,withCaffeine, userId, status: 0, version: 1};
    saveItem && saveItem(editedItem, networkStatus.connected).then(() => {
      if (itemV2 === undefined) history.goBack();
    });
  };

  const handleConflict1 = () => {
    if (oldItem) {
      const editedItem = {
        ...item,
        name,
        quantity,
        available,
        withCaffeine,
        userId,
        status: 0,
        version: oldItem?.version + 1
      };
      saveItem && saveItem(editedItem, networkStatus.connected).then(() => {
        history.goBack();
      });
    }
  };

  const handleConflict2 = () => {
    if (oldItem) {
      const editedItem = {
        ...item,
        name: oldItem?.name,
        quantity: oldItem?.quantity,
        available: oldItem?.available,
        withCaffeine: oldItem?.withCaffeine,
        userId: oldItem?.userId,
        status: oldItem?.status,
        version: oldItem?.version
      };
      saveItem && editedItem && saveItem(editedItem, networkStatus.connected).then(() => {
        history.goBack();
      });
    }
  };

  const handleDelete = () => {
    const removedItem = item ? {...item, name, quantity, available, withCaffeine, userId, status: 0, version: 0}
    : { name, quantity, available, withCaffeine, userId, status: 0, version: 0 };
    deleteItem && deleteItem(removedItem, networkStatus.connected).then(() => history.goBack());

  };
  log('render');

  if (itemV2) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
            <IonButton onClick={handleDelete}>Delete</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        </IonItem>

        <IonItem>
         <IonInput value={quantity} onIonChange={e => setQuantity('' || Number(e.detail.value) )} />
        </IonItem>

        <IonItem>
            <IonLabel>With Caffeine</IonLabel>
            <IonCheckbox slot="start" checked={withCaffeine} onIonChange={e => { if (e.detail.checked === true )
              setWithCaffeine(true); else { if (e.detail.checked === false) setWithCaffeine(false);}}}/>
        </IonItem>
        <IonItem>
          <IonLabel>MM DD YY</IonLabel>
          <IonDatetime value={Moment(new Date(available)).format('MM/DD/YYYY')}
                       onIonChange={e => setAvailable(e.detail.value ? new Date(e.detail.value) : new Date())}/>
        </IonItem>


        {itemV2 && (
            <>
              <IonItem>
                <IonLabel>Name: {itemV2.name}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Quantity: {itemV2.quantity}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Date available: {itemV2.available}</IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>With Caffeine: {itemV2.withCaffeine}</IonLabel>
              </IonItem>

              <IonButton onClick={handleConflict1}>Choose your version</IonButton>
              <IonButton onClick={handleConflict2}>Choose updated version</IonButton>
            </>
        )}

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}

      </IonContent>
    </IonPage>
  );
}
  else
  { return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
            <IonButton onClick={handleDelete}>Delete</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        </IonItem>

        <IonItem>
          <IonInput value={quantity} onIonChange={e => setQuantity('' || Number(e.detail.value) )} />
        </IonItem>

        <IonItem>
          <IonLabel>With Caffeine</IonLabel>
          <IonCheckbox slot="start" checked={withCaffeine} onIonChange={e => { if (e.detail.checked === true )
            setWithCaffeine(true); else { if (e.detail.checked === false) setWithCaffeine(false);}}}/>
        </IonItem>
        <IonItem>
          <IonLabel>MM DD YY</IonLabel>
          <IonDatetime value={Moment(new Date(available)).format('MM/DD/YYYY')}
                       onIonChange={e => setAvailable(e.detail.value ? new Date(e.detail.value) : new Date())}/>
        </IonItem>


        <IonLoading isOpen={saving} />
        {savingError && (
            <div>{savingError.message || 'Failed to save item'}</div>
        )}

      </IonContent>
    </IonPage>
  );
  }
};

export default ItemModify;