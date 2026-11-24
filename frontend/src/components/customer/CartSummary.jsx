import { Link } from 'react-router-dom';

function CartSummary({ subtotal, discount, total, itemCount, checkout = true, onClear }) {
  return (
    <aside className="cart-summary">
      <h2>Order summary</h2>
      <div className="summary-line">
        <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        <strong>₹{subtotal.toFixed(2)}</strong>
      </div>
      {discount > 0 && (
        <div className="summary-line discount-line">
          <span>Discount</span>
          <strong>-₹{discount.toFixed(2)}</strong>
        </div>
      )}
      <div className="summary-total">
        <span>Final total</span>
        <strong>₹{total.toFixed(2)}</strong>
      </div>
      {checkout && (
        <Link className="primary-button summary-checkout" to="/checkout">
          Proceed to checkout
        </Link>
      )}
      {onClear && (
        <button className="summary-clear" type="button" onClick={onClear}>
          Clear cart
        </button>
      )}
    </aside>
  );
}

export default CartSummary;