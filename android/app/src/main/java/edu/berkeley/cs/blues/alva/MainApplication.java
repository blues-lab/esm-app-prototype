package edu.berkeley.cs.blues.alva;;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import com.chirag.RNMail.RNMail;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.pusherman.networkinfo.RNNetworkInfoPackage;
import io.github.traviskn.rnuuidgenerator.RNUUIDGeneratorPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.pilloxa.backgroundjob.BackgroundJobPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.rnfs.RNFSPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSentryPackage(),
            new RNScreensPackage(),
            new RNGestureHandlerPackage(),
            new RNVersionNumberPackage(),
            new RNDeviceInfo(),
            new RNPermissionsPackage(),
            new RNMail(),
            new LocationServicesDialogBoxPackage(),
            new RNNetworkInfoPackage(),
            new RNBackgroundFetchPackage(),
            new RNUUIDGeneratorPackage(),
            new AsyncStoragePackage(),
            new BackgroundJobPackage(),
            new ReactNativePushNotificationPackage(),
            new RNFSPackage(),
            new VectorIconsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
