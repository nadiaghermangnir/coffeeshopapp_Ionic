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
  IonRadioGroup, IonActionSheet, createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import {camera, trash, close} from "ionicons/icons";
import {AuthContext} from "../auth/AuthProvider";
import {useNetwork} from "./useNetwork";
import {Photo, usePhotoGallery} from "./useImageGallery";
import {MapComponent} from "./MapComponent";


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
  const [imgPath, setImgPath] = useState("");
  const [latitude, setLatitude] = useState(47.65371);
  const [longitude, setLongitude] = useState(24.548178);
 // const [caffeine, setCaffeine] = useState(false);
  const [item, setItem] = useState<ItemProps>();
  const {_id} = useContext(AuthContext);
  const [userId, setUserId] = useState(_id);
  const {photos, takePhoto, deletePhoto} = usePhotoGallery();
  const [photoDeleted, setPhotoDeleted] = useState<Photo>();


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
      setImgPath(item.imgPath);
      if (item.latitude) setLatitude(item.latitude);
      if (item.longitude) setLongitude(item.longitude);
      getServerItem && getServerItem(match.params.id!, item?.version);

      //setCaffeine(item.withCaffeine);

    }

  }, [match.params.id, items, getServerItem]);

  useEffect(() => {
    setItemV2(oldItem);
    log("setOldItem: " + JSON.stringify(oldItem));
  }, [oldItem]);

  const handleSave = () => {
    const editedItem = item ? { ...item, name, quantity, available, withCaffeine, userId,status: 0,
          version: item.version ? item.version + 1 : 1, imgPath, latitude, longitude}
    : { name, quantity, available,withCaffeine, userId, status: 0, version: 1, imgPath, latitude, longitude};
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
        version: oldItem?.version + 1,
        imgPath,
        latitude,
        longitude
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
        version: oldItem?.version,
        imgPath: oldItem?.imgPath,
        latitude: oldItem?.latitude,
        longitude: oldItem?.longitude,
      };
      saveItem && editedItem && saveItem(editedItem, networkStatus.connected).then(() => {
        history.goBack();
      });
    }
  };

  const handleDelete = () => {
    const removedItem = item ? {...item, name, quantity, available, withCaffeine, userId, status: 0, version: 0, imgPath, latitude, longitude}
    : { name, quantity, available, withCaffeine, userId, status: 0, version: 0,  imgPath, latitude, longitude };
    deleteItem && deleteItem(removedItem, networkStatus.connected).then(() => history.goBack());

  };
  log('render');


  useEffect(() => {
    async function groupedAnimation() {
      const saveButtonAnimation = createAnimation()
          .addElement(document.getElementsByClassName("button-save")[0])
          .duration(1000)
          .direction('alternate')
          .iterations(Infinity)
          .keyframes([
            {offset: 0, opacity: '0.6', transform: 'scale(0.7)'},
            {offset: 1, opacity: '0.99', transform: 'scale(1)'}
          ])

      const deleteButtonAnimation = createAnimation()
          .addElement(document.getElementsByClassName("button-delete")[0])
          .duration(1000)
          .direction('alternate')
          .iterations(Infinity)
          .keyframes([
            {offset: 0, opacity: '0.6', transform: 'scale(0.7)'},
            {offset: 1, opacity: '0.99', transform: 'scale(1)'}
          ])

      const parentAnipation = createAnimation()
          .duration(1000)
          .iterations(Infinity)
          .direction('alternate')
          .addAnimation([saveButtonAnimation, deleteButtonAnimation])


      parentAnipation.play();
    }

    groupedAnimation();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave} className="button-save">
              Save
            </IonButton>
            <IonButton onClick={handleDelete} className="button-delete">Delete</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonLabel> Coffee name: </IonLabel>
          <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        </IonItem>

        <IonItem>
          <IonLabel> Quantity: </IonLabel>
         <IonInput value={quantity} onIonChange={e => setQuantity('' || Number(e.detail.value) )} />
        </IonItem>

        <IonItem>
            <IonLabel>With Caffeine:</IonLabel>
            <IonCheckbox slot="start" checked={withCaffeine} onIonChange={e => { if (e.detail.checked === true )
              setWithCaffeine(true); else { if (e.detail.checked === false) setWithCaffeine(false);}}}/>
        </IonItem>
        <IonItem>
          <IonLabel>Available since: (MM/DD/YY)</IonLabel>
          <IonDatetime value={Moment(new Date(available)).format('MM/DD/YYYY')}
                       onIonChange={e => setAvailable(e.detail.value ? new Date(e.detail.value) : new Date())}/>
        </IonItem>

        <img src={item?.imgPath} alt="no image"/>
        <MapComponent
            lat={latitude}
            lng={longitude}
            onMapClick={(location: any) => {
              setLatitude(location.latLng.lat());
              setLongitude(location.latLng.lng());
            }}
        />


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
                <IonLabel>With Caffeine: {itemV2.withCaffeine.toString()}</IonLabel>
              </IonItem>

              <IonButton onClick={handleConflict1}>Choose your version</IonButton>
              <IonButton onClick={handleConflict2}>Choose updated version</IonButton>
            </>
        )}

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton
              onClick={() => {
                const photoTaken = takePhoto();
                photoTaken.then((data) => {
                  setImgPath(data.webviewPath!);
                });
              }}
          >
            <IonIcon icon={camera}/>
          </IonFabButton>
        </IonFab>
        <IonActionSheet
            isOpen={!!photoDeleted}
            buttons={[
              {
                text: "Delete",
                role: "destructive",
                icon: trash,
                handler: () => {
                  if (photoDeleted) {
                    deletePhoto(photoDeleted);
                    setPhotoDeleted(undefined);
                  }
                },
              },
              {
                text: "Cancel",
                icon: close,
                role: "cancel",
              },
            ]}
            onDidDismiss={() => setPhotoDeleted(undefined)}
        />

      </IonContent>
    </IonPage>
  );
};


export default ItemModify;