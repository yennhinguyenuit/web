import { useEffect, useState } from 'react';
import { accountAPI } from '../services/api';
import FlashSale from '../components/FlashSale';

const EMPTY_ADDRESS = {
  name: '',
  phone: '',
  address: '',
  city: '',
  district: '',
  ward: '',
  isDefault: false,
};

function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', defaultAddress: '' });
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, addressRes] = await Promise.all([
        accountAPI.getProfile(),
        accountAPI.getAddresses(),
      ]);

      setProfile(profileRes.data);
      setAddresses(addressRes.data || []);
      setProfileForm({
        name: profileRes.data?.name || '',
        phone: profileRes.data?.phone || '',
        defaultAddress: profileRes.data?.defaultAddress || '',
      });
    } catch (error) {
      console.error(error);
      alert(error.message || 'Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const res = await accountAPI.updateProfile(profileForm);
      setProfile(res.data);
      alert(res.message || 'Đã cập nhật tài khoản');
    } catch (error) {
      alert(error.message || 'Không thể cập nhật tài khoản');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      await accountAPI.createAddress(addressForm);
      setAddressForm(EMPTY_ADDRESS);
      await loadData();
      alert('Đã thêm địa chỉ');
    } catch (error) {
      alert(error.message || 'Không thể thêm địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await accountAPI.updateAddress(addressId, { isDefault: true });
      await loadData();
    } catch (error) {
      alert(error.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  const removeAddress = async (addressId) => {
    try {
      await accountAPI.deleteAddress(addressId);
      await loadData();
    } catch (error) {
      alert(error.message || 'Không thể xóa địa chỉ');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-zinc-600">Đang tải tài khoản...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-300">Tài khoản</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Xin chào, {profile?.name || 'bạn'}</h1>
            <p className="mt-4 max-w-2xl text-zinc-300">
              Quản lý hồ sơ, địa chỉ giao hàng và theo dõi các ưu đãi đang mở cho tài khoản của bạn.
            </p>
          </div>
          {profile && (
            <div className="rounded-lg border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-zinc-300">Email</p>
              <p className="mt-1 font-bold">{profile.email}</p>
              <p className="mt-4 text-sm text-zinc-300">Vai trò</p>
              <p className="mt-1 font-bold">{profile.role}</p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <FlashSale />

        <form onSubmit={handleProfileSubmit} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-zinc-950">Cập nhật hồ sơ</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} className="rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Họ tên" />
            <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Số điện thoại" />
          </div>
          <input value={profileForm.defaultAddress} onChange={(event) => setProfileForm((current) => ({ ...current, defaultAddress: event.target.value }))} className="mt-4 w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Địa chỉ mặc định dạng text" />
          <button disabled={savingProfile} className="mt-5 rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60">
            {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </form>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-zinc-950">Địa chỉ đã lưu</h2>
            <div className="mt-5 space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-lg border border-zinc-200 p-4">
                  <p className="font-black text-zinc-950">{address.name} {address.isDefault ? '(Mặc định)' : ''}</p>
                  <p className="mt-1 text-zinc-600">{address.phone}</p>
                  <p className="mt-1 text-zinc-600">{address.address}, {address.ward}, {address.district}, {address.city}</p>
                  <div className="mt-3 flex gap-4 text-sm font-bold">
                    {!address.isDefault && <button onClick={() => setDefaultAddress(address.id)} className="text-zinc-950">Đặt mặc định</button>}
                    <button onClick={() => removeAddress(address.id)} className="text-zinc-500 hover:text-zinc-950">Xóa</button>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && <p className="text-zinc-500">Chưa có địa chỉ nào.</p>}
            </div>
          </div>

          <form onSubmit={handleAddressSubmit} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-zinc-950">Thêm địa chỉ mới</h2>
            <div className="mt-5 space-y-4">
              <input value={addressForm.name} onChange={(event) => setAddressForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Tên người nhận" required />
              <input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Số điện thoại" required />
              <input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} className="w-full rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Số nhà, đường" required />
              <div className="grid gap-4 md:grid-cols-3">
                <input value={addressForm.ward} onChange={(event) => setAddressForm((current) => ({ ...current, ward: event.target.value }))} className="rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Phường/Xã" required />
                <input value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} className="rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Quận/Huyện" required />
                <input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} className="rounded-md border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200" placeholder="Tỉnh/Thành phố" required />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
                <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} />
                Đặt làm mặc định
              </label>
              <button disabled={savingAddress} className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60">
                {savingAddress ? 'Đang thêm...' : 'Thêm địa chỉ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
