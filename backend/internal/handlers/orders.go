package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"kin-coffee/backend/internal/models"
	"kin-coffee/backend/internal/repositories"
	"kin-coffee/backend/internal/services"
)

func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var input models.CheckoutInput
	if err := decodeJSON(w, r, &input); err != nil {
		WriteError(w, http.StatusBadRequest, "Укажите контактные данные и выберите самовывоз или доставку.")
		return
	}
	input, err := services.ValidateCheckout(input)
	if errors.Is(err, services.ErrInvalidInput) {
		WriteError(w, http.StatusBadRequest, "Проверьте контактные данные и укажите адрес для доставки.")
		return
	}

	order, err := h.repository.CreateOrder(r.Context(), currentUserID(r), input)
	if errors.Is(err, repositories.ErrCartEmpty) {
		WriteError(w, http.StatusBadRequest, "Корзина пуста или содержит недоступные товары.")
		return
	}
	if err != nil {
		writeInternalError(w, "Не удалось оформить заказ.")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]any{
		"id": order.ID, "status": order.Status, "total": order.Total,
		"paymentMessage": "Онлайн-оплата появится позже.",
	})
}

func (h *Handler) ListOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := h.repository.Orders(r.Context(), currentUserID(r))
	if err != nil {
		writeInternalError(w, "Не удалось загрузить заказы.")
		return
	}
	WriteJSON(w, http.StatusOK, orders)
}

func (h *Handler) GetOrder(w http.ResponseWriter, r *http.Request) {
	orderID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || orderID < 1 {
		WriteError(w, http.StatusBadRequest, "Некорректный номер заказа.")
		return
	}

	order, err := h.repository.OrderByID(r.Context(), currentUserID(r), orderID)
	if errors.Is(err, repositories.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "Заказ не найден.")
		return
	}
	if err != nil {
		writeInternalError(w, "Не удалось загрузить заказ.")
		return
	}
	WriteJSON(w, http.StatusOK, order)
}
