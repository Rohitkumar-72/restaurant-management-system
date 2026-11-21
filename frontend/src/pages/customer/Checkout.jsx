import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CartSummary from '../../components/customer/CartSummary.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/orderService.js';
import { loadRazorpayCheckout, paymentService } from '../../services/paymentService.js';
import { useTable } from '../../context/TableContext.jsx';

const validateMobile = (value) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, '').slice(-10));

function Checkout() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const { items, itemCount, subtotal, discount, total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const { table: assignedTable, clearTable } = useTable();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    orderType: 'dine-in',
    tableNumber: '',
    instructions: '',
    paymentMethod: 'pay_at_counter',
  });

  useEffect(() => {
    if (items.length === 0 && !submittingRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (assignedTable) {
      setForm((current) => ({
        ...current,
        orderType: 'dine-in',
        tableNumber: assignedTable.tableNumber,
      }));
    }
  }, [assignedTable]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!validateMobile(form.mobile)) nextErrors.mobile = 'Enter a valid 10-digit mobile number.';
    if (!['dine-in', 'takeaway'].includes(form.orderType)) nextErrors.orderType = 'Choose an order type.';
    if (form.orderType === 'dine-in' && (!form.tableNumber.trim() || !/^\d{1,3}$/.test(form.tableNumber))) {
      nextErrors.tableNumber = 'Enter a valid table number.';
    }
    if (form.orderType === 'dine-in' && !assignedTable) {
      nextErrors.tableNumber = 'Select a valid table from a Sapphire Vista QR code.';
    }
    if (items.length === 0) nextErrors.cart = 'Your cart is empty.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submittingRef.current = true;
    setProcessing(true);

    const idempotencyKey =
      sessionStorage.getItem('sapphire-order-draft') ||
      `SV-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
    sessionStorage.setItem('sapphire-order-draft', idempotencyKey);

    try {
      const order = await orderService.createOrder(
        {
          customer: {
            name: form.name.trim(),
            mobile: form.mobile.replace(/\D/g, '').slice(-10),
          },
          items: items.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
          orderType: form.orderType,
          tableNumber: form.orderType === 'dine-in' ? form.tableNumber.trim() : null,
          tableId: form.orderType === 'dine-in' ? assignedTable?.id : null,
          specialInstructions: form.instructions.trim(),
          paymentMethod: 'pay_at_counter',
        },
        idempotencyKey,
      );

      if (form.paymentMethod === 'online') {
        await loadRazorpayCheckout();
        const payment = await paymentService.createPaymentOrder(order._id);
        const checkout = new window.Razorpay({
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: 'Sapphire Vista',
          description: `Order ${order.orderNumber}`,
          order_id: payment.razorpayOrderId,
          prefill: {
            name: form.name.trim(),
            contact: form.mobile.replace(/\D/g, '').slice(-10),
          },
          theme: { color: '#287bff' },
          handler: async (response) => {
            try {
              const verified = await paymentService.verifyPayment({
                orderId: order._id,
                ...response,
              });
              sessionStorage.removeItem('sapphire-order-draft');
              clearCart();
              navigate('/order-confirmation', { state: { order: verified.order || { ...order, paymentStatus: 'PAID' } }, replace: true });
            } catch (verificationError) {
              setErrors({ submit: verificationError.message || 'Payment verification failed.' });
            } finally {
              submittingRef.current = false;
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: async () => {
              try {
                await paymentService.reportFailure(order._id, 'Payment cancelled by customer');
              } catch {
                // Keep the checkout usable if failure reporting is unavailable.
              } finally {
                setProcessing(false);
                submittingRef.current = false;
              }
            },
          },
        });
        checkout.on('payment.failed', async (response) => {
          try {
            await paymentService.reportFailure(order._id, response.error?.description || 'Payment failed');
          } catch {
            // The verification endpoint remains the source of truth.
          } finally {
            setErrors({ submit: 'Payment failed. Please retry.' });
            setProcessing(false);
            submittingRef.current = false;
          }
        });
        checkout.open();
        return;
      }

      sessionStorage.removeItem('sapphire-order-draft');
      clearCart();
      navigate('/order-confirmation', { state: { order }, replace: true });
    } catch (requestError) {
      setErrors({ submit: requestError.message || 'Unable to place order. Please try again.' });
    } finally {
      submittingRef.current = false;
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page page-with-header">
      <section className="page-heading section-shell">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">Final review</p>
          <h1>Checkout</h1>
        </motion.div>
        <Link className="continue-link" to="/cart"><ArrowLeft size={16} /> Back to cart</Link>
      </section>

      {items.length > 0 && (
        <section className="checkout-layout section-shell">
          <form className="checkout-form" onSubmit={submitOrder} noValidate>
            <fieldset>
              <legend>Customer information</legend>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="checkout-name">Customer name</label>
                  <input id="checkout-name" name="name" value={form.name} onChange={updateField} autoComplete="name" placeholder="Your name" />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="checkout-mobile">Mobile number</label>
                  <input id="checkout-mobile" name="mobile" value={form.mobile} onChange={updateField} autoComplete="tel" inputMode="tel" placeholder="10-digit number" />
                  {errors.mobile && <span className="field-error">{errors.mobile}</span>}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Order type</legend>
              <div className="order-type-grid">
                <label className={form.orderType === 'dine-in' ? 'order-type-option active' : 'order-type-option'}>
                  <input type="radio" name="orderType" value="dine-in" checked={form.orderType === 'dine-in'} onChange={updateField} />
                  <UtensilsCrossed size={20} />
                  <span><strong>Dine-in</strong><small>Choose a table</small></span>
                </label>
                <label className={form.orderType === 'takeaway' ? 'order-type-option active' : 'order-type-option'}>
                  <input type="radio" name="orderType" value="takeaway" checked={form.orderType === 'takeaway'} onChange={updateField} />
                  <CheckCircle2 size={20} />
                  <span><strong>Takeaway</strong><small>Collect at the restaurant</small></span>
                </label>
              </div>
              {errors.orderType && <span className="field-error">{errors.orderType}</span>}

              {form.orderType === 'dine-in' && (
                <div className="form-field table-field">
                  <label htmlFor="checkout-table">Table number</label>
                  {assignedTable ? (
                    <div className="assigned-table">
                      <strong>Table {assignedTable.tableNumber}</strong>
                      <button type="button" onClick={clearTable}>Clear table</button>
                    </div>
                  ) : (
                    <div className="assigned-table">
                      <strong>No valid table selected</strong>
                      <span>Scan a table QR code</span>
                    </div>
                  )}
                  {errors.tableNumber && <span className="field-error">{errors.tableNumber}</span>}
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend>Special instructions</legend>
              <div className="form-field">
                <label htmlFor="checkout-instructions">Additional requests <span>(optional)</span></label>
                <textarea id="checkout-instructions" name="instructions" value={form.instructions} onChange={updateField} rows="4" placeholder="Preferences or allergy notes" />
              </div>
            </fieldset>

            <fieldset>
              <legend>Payment method</legend>
              <div className="order-type-grid">
                <label className={form.paymentMethod === 'pay_at_counter' ? 'order-type-option active' : 'order-type-option'}>
                  <input type="radio" name="paymentMethod" value="pay_at_counter" checked={form.paymentMethod === 'pay_at_counter'} onChange={updateField} />
                  <CheckCircle2 size={20} />
                  <span><strong>Pay at restaurant</strong><small>Cash or counter payment</small></span>
                </label>
                <label className={form.paymentMethod === 'online' ? 'order-type-option active' : 'order-type-option'}>
                  <input type="radio" name="paymentMethod" value="online" checked={form.paymentMethod === 'online'} onChange={updateField} />
                  <UtensilsCrossed size={20} />
                  <span><strong>Pay online</strong><small>Secure Razorpay checkout</small></span>
                </label>
              </div>
            </fieldset>

            {errors.cart && <p className="field-error">{errors.cart}</p>}
            {errors.submit && <p className="field-error" role="alert">{errors.submit}</p>}
            <motion.button
              className="primary-button demo-submit"
              type="submit"
              disabled={processing}
              whileTap={{ scale: 0.98 }}
            >
              {processing
                ? (form.paymentMethod === 'online' ? 'Opening secure payment...' : 'Submitting order...')
                : (form.paymentMethod === 'online' ? 'Continue to secure payment' : 'Place order')}
            </motion.button>
          </form>

          <CartSummary
            subtotal={subtotal}
            discount={discount}
            total={total}
            itemCount={itemCount}
            checkout={false}
          />
        </section>
      )}
    </div>
  );
}

export default Checkout;