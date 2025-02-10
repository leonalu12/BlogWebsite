package pccit.finalproject.javaclient;

import pccit.finalproject.javaclient.controller.AdminController;
import pccit.finalproject.javaclient.view.AdminDashboard;

public class Main {
    public static void main(String[] args) {
        AdminDashboard dashboard = new AdminDashboard();
        new AdminController(dashboard);
    }
}
