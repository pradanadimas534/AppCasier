package com.example.kasir;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "ThermalPrinter",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            }
        )
    }
)
public class ThermalPrinterPlugin extends Plugin {
    // Standard Serial Port Profile (SPP) UUID used by 58mm/80mm Bluetooth thermal printers
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothAdapter getBluetoothAdapter() {
        BluetoothManager manager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager != null) {
            return manager.getAdapter();
        }
        return BluetoothAdapter.getDefaultAdapter();
    }

    private boolean hasBluetoothPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return true;
        }
        return getPermissionState("bluetooth") == PermissionState.GRANTED;
    }

    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (!hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "pairedDevicesPermCallback");
            return;
        }
        resolvePairedDevices(call);
    }

    @PermissionCallback
    private void pairedDevicesPermCallback(PluginCall call) {
        if (hasBluetoothPermission()) {
            resolvePairedDevices(call);
        } else {
            call.reject("Izin Bluetooth ditolak. Aktifkan izin Perangkat Sekitar di pengaturan HP.");
        }
    }

    @SuppressLint("MissingPermission")
    private void resolvePairedDevices(PluginCall call) {
        BluetoothAdapter adapter = getBluetoothAdapter();
        if (adapter == null) {
            call.reject("Perangkat ini tidak mendukung Bluetooth.");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Bluetooth belum menyala. Nyalakan Bluetooth di HP Anda terlebih dahulu.");
            return;
        }

        Set<BluetoothDevice> bonded = adapter.getBondedDevices();
        JSArray devices = new JSArray();
        if (bonded != null) {
            for (BluetoothDevice device : bonded) {
                JSObject item = new JSObject();
                item.put("name", device.getName() != null ? device.getName() : "Printer Bluetooth");
                item.put("address", device.getAddress());
                devices.put(item);
            }
        }

        JSObject ret = new JSObject();
        ret.put("devices", devices);
        call.resolve(ret);
    }

    @PluginMethod
    public void printBase64(PluginCall call) {
        if (!hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "printPermCallback");
            return;
        }
        executePrint(call);
    }

    @PermissionCallback
    private void printPermCallback(PluginCall call) {
        if (hasBluetoothPermission()) {
            executePrint(call);
        } else {
            call.reject("Izin Bluetooth dibutuhkan untuk mencetak ke printer.");
        }
    }

    @SuppressLint("MissingPermission")
    private void executePrint(PluginCall call) {
        String address = call.getString("address");
        String base64Data = call.getString("data");

        if (address == null || address.trim().isEmpty()) {
            call.reject("Alamat printer Bluetooth belum dipilih.");
            return;
        }
        if (base64Data == null || base64Data.isEmpty()) {
            call.reject("Data struk kosong.");
            return;
        }

        BluetoothAdapter adapter = getBluetoothAdapter();
        if (adapter == null) {
            call.reject("Perangkat tidak mendukung Bluetooth.");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Bluetooth mati. Nyalakan Bluetooth terlebih dahulu.");
            return;
        }

        final byte[] payload;
        try {
            payload = Base64.decode(base64Data, Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Format data cetak tidak valid.");
            return;
        }

        // Run Bluetooth socket I/O on a background thread so UI never freezes
        new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                BluetoothDevice device = adapter.getRemoteDevice(address);
                adapter.cancelDiscovery();
                try {
                    socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                    socket.connect();
                } catch (Exception primaryErr) {
                    // Fallback 1: insecure RFCOMM socket
                    if (socket != null) {
                        try { socket.close(); } catch (Exception ignored) {}
                    }
                    try {
                        socket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
                        socket.connect();
                    } catch (Exception secondaryErr) {
                        // Fallback 2: direct RFCOMM Channel 1 reflection (fixes many 58mm Chinese thermal printers)
                        if (socket != null) {
                            try { socket.close(); } catch (Exception ignored) {}
                        }
                        socket = (BluetoothSocket) device.getClass()
                            .getMethod("createRfcommSocket", int.class)
                            .invoke(device, 1);
                        socket.connect();
                    }
                }

                OutputStream out = socket.getOutputStream();
                // Write in small chunks so slow 58mm thermal printer buffers don't drop bytes
                int chunkSize = 128;
                for (int offset = 0; offset < payload.length; offset += chunkSize) {
                    int len = Math.min(chunkSize, payload.length - offset);
                    out.write(payload, offset, len);
                    out.flush();
                    Thread.sleep(25);
                }
                // Wait for printer buffer to finish printing before closing socket
                Thread.sleep(1200);

                JSObject res = new JSObject();
                res.put("printed", true);
                call.resolve(res);
            } catch (Exception e) {
                call.reject("Gagal mencetak ke printer: " + e.getMessage());
            } finally {
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (Exception ignored) {}
                }
            }
        }).start();
    }
}
