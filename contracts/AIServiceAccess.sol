// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AIServiceAccess
 * @dev Smart contract for managing pay-per-access AI services on Avalanche
 * Implements x402 payment standard for AI API access control
 */
contract AIServiceAccess {
    address public owner;
    
    struct Service {
        uint256 id;
        string name;
        uint256 price; // Price in wei (AVAX)
        address provider;
        bool active;
    }
    
    // Service ID => Service details
    mapping(uint256 => Service) public services;
    
    // User address => Service ID => Has paid
    mapping(address => mapping(uint256 => bool)) public accessGranted;
    
    // Service counter
    uint256 public serviceCount;
    
    // Events
    event ServiceRegistered(
        uint256 indexed serviceId,
        string name,
        uint256 price,
        address provider
    );
    
    event AccessGranted(
        address indexed user,
        uint256 indexed serviceId,
        uint256 amount
    );
    
    event ServiceDeactivated(uint256 indexed serviceId);
    
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier serviceExists(uint256 _serviceId) {
        require(_serviceId < serviceCount, "Service does not exist");
        require(services[_serviceId].active, "Service is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        serviceCount = 0;
    }
    
    /**
     * @dev Register a new AI service
     * @param _name Name of the service
     * @param _price Price in wei (AVAX)
     * @param _provider Address of the service provider
     */
    function registerService(
        string memory _name,
        uint256 _price,
        address _provider
    ) external onlyOwner {
        require(_price > 0, "Price must be greater than 0");
        require(_provider != address(0), "Invalid provider address");
        
        services[serviceCount] = Service({
            id: serviceCount,
            name: _name,
            price: _price,
            provider: _provider,
            active: true
        });
        
        emit ServiceRegistered(serviceCount, _name, _price, _provider);
        serviceCount++;
    }
    
    /**
     * @dev Pay for access to a service
     * @param _serviceId ID of the service to access
     */
    function payForService(uint256 _serviceId) 
        external 
        payable 
        serviceExists(_serviceId) 
    {
        Service memory service = services[_serviceId];
        require(msg.value >= service.price, "Insufficient payment");
        require(!accessGranted[msg.sender][_serviceId], "Access already granted");
        
        // Grant access
        accessGranted[msg.sender][_serviceId] = true;
        
        // Refund excess payment
        if (msg.value > service.price) {
            uint256 refund = msg.value - service.price;
            payable(msg.sender).transfer(refund);
        }
        
        emit AccessGranted(msg.sender, _serviceId, service.price);
    }
    
    /**
     * @dev Check if user has access to a service
     * @param _user Address of the user
     * @param _serviceId ID of the service
     * @return bool True if user has access
     */
    function hasAccess(address _user, uint256 _serviceId) 
        external 
        view 
        returns (bool) 
    {
        return accessGranted[_user][_serviceId];
    }
    
    /**
     * @dev Deactivate a service
     * @param _serviceId ID of the service to deactivate
     */
    function deactivateService(uint256 _serviceId) 
        external 
        onlyOwner 
        serviceExists(_serviceId) 
    {
        services[_serviceId].active = false;
        emit ServiceDeactivated(_serviceId);
    }
    
    /**
     * @dev Get service details
     * @param _serviceId ID of the service
     * @return Service details
     */
    function getService(uint256 _serviceId) 
        external 
        view 
        returns (
            uint256 id,
            string memory name,
            uint256 price,
            address provider,
            bool active
        ) 
    {
        Service memory service = services[_serviceId];
        return (
            service.id,
            service.name,
            service.price,
            service.provider,
            service.active
        );
    }
    
    /**
     * @dev Withdraw collected funds (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner).transfer(balance);
        emit FundsWithdrawn(owner, balance);
    }
    
    /**
     * @dev Get contract balance
     * @return uint256 Current balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Transfer ownership
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        owner = _newOwner;
    }
}
