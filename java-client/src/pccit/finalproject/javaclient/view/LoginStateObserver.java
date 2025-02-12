package pccit.finalproject.javaclient.view;

public interface LoginStateObserver {
    void onLoginStateChanged(boolean isLoggedIn, String username);
}
