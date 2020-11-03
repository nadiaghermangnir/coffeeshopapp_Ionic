import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import {trash} from "ionicons/icons";

const log = getLogger('ItemModify');

interface ItemModifyProps extends RouteComponentProps<{
  id?: string;
}> {}

const ItemModify: React.FC<ItemModifyProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem , deleting, deletingError, deleteItem} = useContext(ItemContext);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
 // const [caffeine, setCaffeine] = useState(false);
  const [item, setItem] = useState<ItemProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it.id === routeId);
    setItem(item);
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      //setCaffeine(item.withCaffeine);

    }

  }, [match.params.id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, name, quantity } : { name, quantity};
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };

  const handleDelete = () => {
    const removedItem = item ? {...item, name, quantity } : { name, quantity };
    deleteItem && deleteItem(removedItem).then(() => history.goBack());

  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        <IonInput value={quantity} onIonChange={e => setQuantity('' || Number(e.detail.value) )} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleDelete}>
            <IonIcon icon={trash}/>
          </IonFabButton>
        </IonFab>
        <IonLoading isOpen={deleting} />
        {deletingError && (
            <div>{deletingError.message || 'Failed to delete item'}</div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default ItemModify;