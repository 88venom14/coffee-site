package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"kin-coffee/backend/internal/models"
	"kin-coffee/backend/internal/repositories"
)

func (h *Handler) GetCart(w http.ResponseWriter, r *http.Request) {
	cart, err := h.repository.Cart(r.Context(), currentUserID(r))
	if err != nil {
		writeInternalError(w, "Не удалось загрузить корзину.")
		return
	}
	WriteJSON(w, http.StatusOK, cart)
}

func (h *Handler) AddCartItem(w http.ResponseWriter, r *http.Request) {
	var input models.AddCartItemInput
	if err := decodeJSON(w, r, &input); err != nil || input.ProductID < 1 || input.Quantity < 1 || input.Quantity > 99 {
		WriteError(w, http.StatusBadRequest, "Укажите корректное количество товара.")
		return
	}

	err := h.repository.AddCartItem(r.Context(), currentUserID(r), input.ProductID, input.Quantity)
	if errors.Is(err, repositories.ErrUnavailable) {
		WriteError(w, http.StatusNotFound, "Этот товар сейчас недоступен.")
		return
	}
	if err != nil {
		writeInternalError(w, "Не удалось обновить корзину.")
		return
	}
	h.GetCart(w, r)
}

func (h *Handler) UpdateCartItem(w http.ResponseWriter, r *http.Request) {
	itemID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	var input models.UpdateCartItemInput
	if err != nil || itemID < 1 || decodeJSON(w, r, &input) != nil || input.Quantity < 1 || input.Quantity > 99 {
		WriteError(w, http.StatusBadRequest, "Количество должно быть от 1 до 99.")
		return
	}

	if err := h.repository.UpdateCartItem(r.Context(), currentUserID(r), itemID, input.Quantity); err != nil {
		h.writeCartItemError(w, err, "Не удалось обновить корзину.")
		return
	}
	h.GetCart(w, r)
}

func (h *Handler) DeleteCartItem(w http.ResponseWriter, r *http.Request) {
	itemID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || itemID < 1 {
		WriteError(w, http.StatusBadRequest, "Некорректная позиция корзины.")
		return
	}

	if err := h.repository.RemoveCartItem(r.Context(), currentUserID(r), itemID); err != nil {
		h.writeCartItemError(w, err, "Не удалось удалить товар.")
		return
	}
	h.GetCart(w, r)
}

func (h *Handler) ClearCart(w http.ResponseWriter, r *http.Request) {
	if err := h.repository.ClearCart(r.Context(), currentUserID(r)); err != nil {
		writeInternalError(w, "Не удалось очистить корзину.")
		return
	}
	h.GetCart(w, r)
}

func (h *Handler) writeCartItemError(w http.ResponseWriter, err error, message string) {
	if errors.Is(err, repositories.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "Товар не найден в корзине.")
		return
	}
	writeInternalError(w, message)
}
