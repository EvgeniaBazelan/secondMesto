import './index.css'
import Section from '../scripts/components/Section.js';
import Card from '../scripts/components/Card.js'
import PopupWithImage from '../scripts/components/PopupWithImage.js'
import { initialCards, addBtn, editBtn, settingsObj, popupProfileForValid, popupAddForValid, saveBtn, apiOptions, changeAvatar, popupAvatarForValid } from '../scripts/utils/constants.js'
import PopupWithForm from '../scripts/components/PopupWithForm.js';
import UserInfo from '../scripts/components/UserInfo.js'
import FormValidator from '../scripts/components/FormValidator.js'
import Api from '../scripts/components/Api.js'

let userId = null
    /*const getMyUserId = new Promise((resolves, rejectes) => {
            if (userId &&
                userId.length > 0)
                resolves(userId)
            else
                rejectes()
        })
        .catch(_ => api.getUserInfo().then(res => userId = res._id))*/

const api = new Api(apiOptions)

const user = new UserInfo({
    userNameSelector: ".profile__name",
    userInfoSelector: ".profile__profession",
    userAvatarSelector: ".profile__avatar"
})


const popupProfile = new PopupWithForm((data) => {
    popupProfile.renderLoading(true)
    api.changeUserInfo(data.name, data.profession).then((res) => {
        user.setUserInfoForm(res.name, res.about)
        popupProfile.close()
    }).finally(() => { popupProfile.renderLoading(false) })

}, '.popup_edit-profile')
popupProfile.setEventListeners()

function openPopupFunc() {
    popupProfileFormValidator.resetValidation()
    const userInfo = user.getUserInfo();
    popupProfile.open(userInfo);

}
editBtn.addEventListener('click', openPopupFunc)
const popupProfileFormValidator = new FormValidator(settingsObj, popupProfileForValid)
popupProfileFormValidator.enableValidation()

const popupView = new PopupWithImage('.popup_view')
popupView.setEventListeners()

function openView(item) {
    popupView.open(item)
}

function addOpenPopup() {
    popupAddFormValidator.resetValidation()
    popupAdd.open();

}

addBtn.addEventListener('click', addOpenPopup);
const popupAddFormValidator = new FormValidator(settingsObj, popupAddForValid);
popupAddFormValidator.enableValidation()



function createCard(item, myId) {
    const card = new Card(item, openView, myId, ".photo-grid-template", toggleLikeCard, handleDeleteCard);
    return card.generateCard()
}


function toggleLikeCard(liked, id) {
    if (liked)
        return api.like(id).then((data) => {
            return data.likes
        })
    else
        return api.dislike(id).then((data) => {
            return data.likes
        })
}


const cardList = new Section(
    createCard,
    ".photo-grid");

const popupAdd = new PopupWithForm(
    (data) => {
        popupAdd.renderLoading(true)
        api.postNewCard(data.title, data.link).then((res) => {
            cardList.addAtFirstItem(createCard(res, userId))
            popupAdd.close()
        }).finally(() => { popupAdd.renderLoading(false) })

        /*getMyUserId
        .then(userId =>
            api.postNewCard(data.title, data.link)
            .then(res => {
                cardList.addAtFirstItem(createCard(res, userId))
                popupAdd.close()
            })).finally(() => { popupAdd.renderLoading(false) })*/

        /*const initialCardElement = createCard({ name: data.title, link: data.link })
        cardList.addAtFirstItem(initialCardElement);*/

    }, '.popup_add-place')
popupAdd.setEventListeners()

function handleDeleteCard(cardId, element) {
    const popup = new PopupWithForm(() => {
        popup.renderLoading(true)
        api.deleteMyCard(cardId).then(_ => {
            popup.removeEventListeners();
            element.remove()
            popup.close()
        }).finally(() => { popup.renderLoading(false) })
    }, ".popup_confirm", () => {
        popup.removeEventListeners();
    })
    popup.setEventListeners()
    popup.open()

}

const popupAvatar = new PopupWithForm((data) => {
        popupAvatar.renderLoading(true)
        api.changeAvatar(data.link).then((res) => {
            user.setUserInfoForAvatar(res.avatar)
            popupAvatar.close()
        }).finally(() => { popupAvatar.renderLoading(false) })
    },
    ".popup_update",
    () => {
        popupAvatar.removeEventListeners();
    }
)

function openPopupFuncAvatar() {
    popupAvatarFormValidator.resetValidation()

    popupAvatar.open();

}
const popupAvatarFormValidator = new FormValidator(settingsObj, popupAvatarForValid)
popupAvatarFormValidator.enableValidation()

changeAvatar.addEventListener('click', openPopupFuncAvatar)
popupAvatar.setEventListeners()

api.getUserInfo().then((userInfo) => {
    user.setUserInfo(userInfo.name, userInfo.about, userInfo.avatar)
    return userId = userInfo._id
}).then(myId => {
    return api.getInitialCards().then(cards => new Promise(resolves => {
        resolves({
            myId: myId,
            cards: cards
        })
    }))
}).then(cardList.renderItems.bind(cardList))